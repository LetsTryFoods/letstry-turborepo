import axios from "axios";
import { LegacyOrder, PunchResult } from "./types";

const SHIPROCKET_API_URL =
  process.env.SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external";

export class ShiprocketClient {
  private static token: string | null = null;

  private static async getToken() {
    if (this.token) return this.token;

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new Error("Shiprocket credentials missing");
    }

    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email,
      password,
    });

    this.token = response.data.token;
    return this.token;
  }

  static async bookShipment(order: LegacyOrder): Promise<PunchResult> {
    try {
      const token = await this.getToken();

      const payload = {
        order_id: order.orderId,
        order_date: new Date(
          typeof order.createdAt === "string"
            ? order.createdAt
            : order.createdAt.$date,
        )
          .toISOString()
          .split("T")[0],
        pickup_location:
          order.pickupLocation ||
          process.env.SHIPROCKET_DEFAULT_PICKUP_LOCATION ||
          "Primary",
        billing_customer_name: order.address.recipientName,
        billing_last_name: "",
        billing_address: `${order.address.buildingName} ${order.address.street}`,
        billing_city: order.address.city,
        billing_pincode: order.address.pincode,
        billing_state: order.address.state,
        billing_country: order.address.country,
        billing_email: "customer@example.com",
        billing_phone: order.address.recipientPhoneNumber,
        shipping_is_billing: true,
        order_items: order.items.map((item) => ({
          name: item.name,
          sku: item.name.replace(/\s+/g, "-").toLowerCase(),
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: "Prepaid",
        sub_total: order.totalAmount,
        length: order.length || 10,
        breadth: order.breadth || 10,
        height: order.height || 10,
        weight: order.weight || 0.5,
      };

      const response = await axios.post(
        `${SHIPROCKET_API_URL}/shipments/create/forward-shipment`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        success: true,
        awbNumber: response.data.awb_code,
        labelUrl: response.data.label_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

export class DtdcClient {
  private static getBaseUrl() {
    const env = process.env.DTDC_ENVIRONMENT || "staging";
    return env === "production"
      ? "https://pxapi.dtdc.in/api/customer/integration/"
      : "https://demodashboardapi.shipsy.in/api/customer/integration/";
  }

  static async bookShipment(order: LegacyOrder): Promise<PunchResult> {
    try {
      const baseUrl = this.getBaseUrl();
      const apiKey = process.env.DTDC_API_KEY;
      const customerCode = process.env.DTDC_CUSTOMER_CODE;

      if (!apiKey || !customerCode) {
        throw new Error("DTDC credentials missing");
      }

      const warehouseAddress = process.env.WAREHOUSE_ADDRESS_LINE1 || "";
      if (warehouseAddress.length < 3) {
        throw new Error(
          "WAREHOUSE_ADDRESS_LINE1 env var is missing or too short (min 3 chars)",
        );
      }

      const payload = {
        consignments: [
          {
            customer_code: customerCode,
            service_type_id: process.env.DTDC_SERVICE_TYPE || "GROUND EXPRESS",
            load_type: process.env.DTDC_LOAD_TYPE || "NON-DOCUMENT",
            consignment_type: "Forward",
            dimension_unit: "cm",
            length: (order.length || 10).toString(),
            width: (order.breadth || 10).toString(),
            height: (order.height || 10).toString(),
            weight_unit: "kg",
            weight: (order.weight || 0.5).toString(),
            declared_value: order.totalAmount.toString(),
            num_pieces: "1",
            origin_details: {
              name: process.env.WAREHOUSE_NAME || "Warehouse",
              phone: process.env.WAREHOUSE_PHONE || "",
              address_line_1: process.env.WAREHOUSE_ADDRESS_LINE1 || "",
              pincode: process.env.WAREHOUSE_PINCODE || "",
              city: process.env.WAREHOUSE_CITY || "",
              state: process.env.WAREHOUSE_STATE || "",
            },
            destination_details: {
              name: order.address.recipientName,
              phone: order.address.recipientPhoneNumber,
              address_line_1: `${order.address.buildingName} ${order.address.street}`,
              pincode: order.address.pincode,
              city: order.address.city,
              state: order.address.state,
            },
            customer_reference_number: order.orderId,
            cod_amount: "0",
            commodity_id: process.env.DTDC_COMMODITY_ID || "10",
            description: "Legacy Order Import",
          },
        ],
      };

      const response = await axios.post(
        `${baseUrl}consignment/softdata`,
        payload,
        {
          headers: { "api-key": apiKey },
        },
      );

      if (
        response.data?.status !== "OK" ||
        !response.data?.data?.[0]?.success
      ) {
        throw new Error(
          response.data?.data?.[0]?.message || "DTDC Booking failed",
        );
      }

      const awbNumber = response.data.data[0].reference_number;

      // Try to get label
      let labelUrl = "";
      try {
        const labelResp = await axios.get(
          `${baseUrl}consignment/shippinglabel/stream?reference_number=${awbNumber}&label_code=SHIP_LABEL_4X6&label_format=pdf`,
          {
            headers: { "api-key": apiKey },
            responseType: "arraybuffer",
          },
        );
        const base64 = Buffer.from(labelResp.data, "binary").toString("base64");
        labelUrl = `data:application/pdf;base64,${base64}`;
      } catch (err) {
        console.error("Failed to fetch DTDC label", err);
      }

      return {
        success: true,
        awbNumber,
        labelUrl,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}
