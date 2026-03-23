





import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
// ✅ FIX: MaterialIcons ko Ionicons se replace kiya
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
// ✅ FIX: Isko import karna zaroori hai
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCALE = 0.87;

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // ✅ FIX: Hook se insets liye

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* ✅ FIX: Header code is now directly here, with the new style */}
      <LinearGradient
        colors={["#F2D377", "#F5F5F5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={{ paddingTop: insets.top }}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
              </TouchableOpacity>

              <Text style={styles.headerTitle} allowFontScaling={false} adjustsFontSizeToFit>
                Privacy Policy
              </Text>
              <View style={styles.iconButtonRight} />
            </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        
        <Text style={styles.paragraph}>
          This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from www.letstryfoods.com (the "Site") or use our mobile application (the "App").
        </Text>

        <Text style={styles.sectionTitle}>WHAT WE COLLECT:</Text>
        <Text style={styles.paragraph}>
          When you visit the Site or use our App, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies installed on your device. Additionally, as you browse, we collect information about the individual web pages or products that you view, what websites or search terms referred you, and how you interact with the Site or App. We refer to this automatically-collected information as "Device Information."
        </Text>

        <Text style={styles.paragraph}>
          Additionally, when you make or attempt to make a purchase through the Site or App, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this as "Order Information."
        </Text>

        <Text style={styles.sectionTitle}>COOKIES</Text>
        <Text style={styles.paragraph}>
          We use "cookies," which are small data files stored on your device, to enhance your Browse experience. These cookies do not contain any personally identifiable information.
        </Text>

        <Text style={styles.paragraph}>
          We use cookies to:
        </Text>

        <View style={styles.bulletGroup}>
          <Text style={styles.bulletPoint}>
            • Help remember and process items in your shopping cart
          </Text>
          <Text style={styles.bulletPoint}>
            • Understand and save your preferences for future visits
          </Text>
          <Text style={styles.bulletPoint}>
            • Analyze traffic and user interaction for better experiences in the future.
          </Text>
          <Text style={styles.bulletPoint}>
            • We may use trusted third-party services (e.g., Google Analytics) to collect this data on our behalf.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>LOG FILES</Text>
        <Text style={styles.paragraph}>
          Like many websites, we use "log files" that track actions on the Site or App and collect data such as: IP address, Browser type, Internet service provider, Referring/exit pages, Date/time stamps.
        </Text>

        <Text style={styles.sectionTitle}>SHARING OF PERSONAL INFORMATION</Text>
        <Text style={styles.paragraph}>
          We may share personal information with corporate affiliates or third-party service providers to: Fulfill orders and transactions. Deliver marketing and promotional materials, Comply with legal obligations, Prevent fraud or illegal activities.
        </Text>

        <Text style={styles.paragraph}>
          We do not sell your personal information or share it with third parties for their own marketing purposes without your explicit consent.
        </Text>

        <Text style={styles.paragraph}>
          Let's Try Foods may disclose personal information to comply with applicable laws, respond to legal requests, enforce our policies, or protect rights, property, or safety.
        </Text>

        <Text style={styles.sectionTitle}>LINKS TO THIRD-PARTY WEBSITES</Text>
        <Text style={styles.paragraph}>
          Our Site and App may contain links to external websites. We are not responsible for the privacy practices or content of such websites and encourage you to review their policies.
        </Text>

        <Text style={styles.sectionTitle}>SECURITY PRECAUTIONS</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to safeguard your personal information. When you access your account or place orders, secure servers and encryption protocols are used. Despite our efforts, no method of transmission or storage is 100% secure.
        </Text>

        <Text style={styles.paragraph}>
          Let's Try Foods shall not be held responsible for any loss or misuse of data caused by events beyond our control, such as natural disasters, cyber-attacks, or system failures (Force Major Events).
        </Text>

        <Text style={styles.sectionTitle}>ADVERTISEMENTS</Text>
        <Text style={styles.paragraph}>
          We may use third-party advertising networks to display ads on our Site or App. These providers may use non-personally identifiable information (not including your name, email, or phone number) about your visits to deliver relevant ads.
        </Text>

        <Text style={styles.sectionTitle}>EMAIL SUBSCRIPTION</Text>
        <Text style={styles.paragraph}>
          If at any time you wish to unsubscribe from marketing or promotional emails, please contact us at <Text style={styles.email}>hello@letstryfoods.com</Text>, and we will promptly remove you from our mailing list.
        </Text>

        <Text style={styles.sectionTitle}>DATA RETENTION</Text>
        <Text style={styles.paragraph}>
          We retain your Order Information for our records unless and until you request its deletion.
        </Text>

        <Text style={styles.sectionTitle}>BEHAVIORAL ADVERTISING</Text>
        <Text style={styles.paragraph}>
          We use your personal data to deliver targeted advertising and marketing communications that we believe will interest you. You can opt out by following the instructions provided in those messages or by contacting us directly.
        </Text>

        <Text style={styles.sectionTitle}>CHANGES TO THIS POLICY</Text>
        <Text style={styles.paragraph}>
          This privacy policy is subject to change without prior notice. Updates will be posted on this page, and we encourage you to review it periodically to stay informed.
        </Text>

        <Text style={styles.sectionTitle}>CONTACT US</Text>
        <Text style={styles.paragraph}>
          For questions or concerns about this Privacy Policy, please contact us at:
        </Text>

        <View style={styles.contactInfo}>
          <Text style={styles.paragraph}>Let's Try Foods</Text>
          <Text style={styles.paragraph}>Email: <Text style={styles.email}>hello@letstryfoods.com</Text></Text>
          <Text style={styles.paragraph}>Website: <Text style={styles.email}>www.letstryfoods.com</Text></Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  // ✅ FIX: Purane styles ko naye wale se replace kiya
  header: {
    paddingBottom: hp(1.5),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },
  iconButton: { padding: wp(1) },
  iconButtonRight: { padding: wp(3) },
  headerTitle: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#222",
  },
  contentContainer: {
    padding: wp(5),
    paddingBottom: hp(5),
  },
  sectionTitle: {
    fontSize: RFValue(15 * SCALE),
    fontWeight: "700",
    color: "#222",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  paragraph: {
    fontSize: RFValue(13.5 * SCALE),
    color: "#444",
    marginBottom: hp(1.2),
    lineHeight: RFValue(21 * SCALE),
  },
  bulletGroup: {
    marginLeft: wp(2),
    marginBottom: hp(1.2),
  },
  bulletPoint: {
    fontSize: RFValue(13.5 * SCALE),
    color: "#444",
    marginBottom: hp(0.8),
    lineHeight: RFValue(21 * SCALE),
  },
  email: {
    color: "#0C5273",
    fontWeight: "600",
  },
  contactInfo: {
    marginLeft: wp(2),
    marginTop: hp(0.5),
  },
});