import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import auth from "@react-native-firebase/auth";
import { fetchMyOrders } from "../services/OrderService"; // Adjust the import path as needed

const InTransitContext = createContext();

export const useInTransit = () => useContext(InTransitContext);

export const InTransitProvider = ({ children }) => {
  const [inTransit, setInTransit] = useState(false);
  const [checking, setChecking] = useState(true);

  // Function to check in-transit orders
  const checkInTransitOrders = useCallback(async () => {
    setChecking(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        setInTransit(false);
        setChecking(false);
        return;
      }
      const token = await user.getIdToken();
      const orders = await fetchMyOrders(token);

      // Check for in-transit order
      const found = Array.isArray(orders)
        ? orders.some(
            (o) => o.status2 && o.status2.toLowerCase() === "out for delivery"
          )
        : false;
      setInTransit(found);
    } catch (error) {
      setInTransit(false);
      console.error("Error checking in-transit orders:", error);
    } finally {
      setChecking(false);
    }
  }, []);

  // Run check on mount
  useEffect(() => {
    checkInTransitOrders();
  }, [checkInTransitOrders]);

  return (
    <InTransitContext.Provider
      value={{
        inTransit,
        setInTransit,
        checking,
        refreshInTransitStatus: checkInTransitOrders,
      }}
    >
      {children}
    </InTransitContext.Provider>
  );
};
