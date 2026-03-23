// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   StatusBar,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useNavigation } from "@react-navigation/native";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// const SCALE = 0.87;

// const TermsOfServiceScreen = () => {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       {/* Header */}
//       <LinearGradient
//         colors={["#F2D377", "#F5F5F5"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//         style={styles.header}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Icon name="chevron-left" size={RFValue(24 * SCALE)} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle} allowFontScaling={false}>
//             Terms of Service
//           </Text>
//           <View style={{ width: RFValue(24 * SCALE) }} />
//         </View>
//       </LinearGradient>

//       {/* Content */}
//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
//         <Text style={styles.subTitle}>OVERVIEW</Text>
        
//         <Text style={styles.paragraph}>
//           This website: https://letstryfoods.com/ is owned and operated by Earth Crust company. Throughout the site, the terms "we," "us" and "our" refer to Earth Crust company. The website including all the literature and information, tools, and services available from the site to you the user, is conditioned upon your acceptance of all terms, conditions, policies, and notices stated here and is offered to you by Earth Crust company.
//         </Text>

//         <Text style={styles.paragraph}>
//           By visiting our site and/or purchasing from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
//         </Text>

//         <Text style={styles.paragraph}>
//           Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, you may choose not to access the website or use any of its services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.
//         </Text>

//         <Text style={styles.paragraph}>
//           Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
//         </Text>

//         <Text style={styles.sectionTitle}>ONLINE STORE TERMS</Text>
//         <Text style={styles.paragraph}>
//           You may not use our products for any illegal or unauthorized purpose nor may you in the use of the Service violate any laws in your jurisdiction (including, but not limited to copyright laws). You must not transmit any worms or viruses or any code of a destructive nature.
//         </Text>

//         <Text style={styles.paragraph}>
//           A breach or violation of any of the Terms will result in an immediate termination of your Services.
//         </Text>

//         <Text style={styles.sectionTitle}>GENERAL CONDITIONS</Text>
//         <Text style={styles.paragraph}>
//           We reserve the right to refuse service to anyone for any reason at any time.
//         </Text>

//         <Text style={styles.paragraph}>
//           You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to the technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.
//         </Text>

//         <Text style={styles.paragraph}>
//           You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express wrote permission by us.
//         </Text>

//         <Text style={styles.paragraph}>
//           The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
//         </Text>

//         <Text style={styles.sectionTitle}>ACCURACY, COMPLETENESS, AND TIMELINESS OF INFORMATION</Text>
//         <Text style={styles.paragraph}>
//           We are not responsible if the information made available on this site is not accurate, complete, or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate and complete, or more timely sources of information. Any reliance on the material on this site is at your own risk.
//         </Text>

//         <Text style={styles.sectionTitle}>MODIFICATIONS TO THE SERVICE AND PRICES</Text>
//         <Text style={styles.paragraph}>
//           Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part or content thereof) without notice at any time.
//         </Text>

//         <Text style={styles.paragraph}>
//           We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.
//         </Text>

//         <Text style={styles.sectionTitle}>PRODUCTS OR SERVICES</Text>
//         <Text style={styles.paragraph}>
//           Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Returns Policy.
//         </Text>

//         <Text style={styles.paragraph}>
//           We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
//         </Text>

//         <Text style={styles.paragraph}>
//           We reserve the right but are not obligated, to limit the sales of our products or Services to any person, geographic region, or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
//         </Text>

//         <Text style={styles.paragraph}>
//           We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
//         </Text>

//         <Text style={styles.sectionTitle}>ACCURACY OF BILLING AND ACCOUNT INFORMATION</Text>
//         <Text style={styles.paragraph}>
//           We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. If we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/ phone number provided at the time the order was made. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.
//         </Text>

//         <Text style={styles.paragraph}>
//           You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers, and expiration dates, so that we can complete your transactions and contact you as needed.
//         </Text>

//         <Text style={styles.paragraph}>
//           For more details, please review our Returns Policy.
//         </Text>

//         <Text style={styles.sectionTitle}>OPTIONAL TOOLS</Text>
//         <Text style={styles.paragraph}>
//           We may provide you with access to third-party tools over which we neither monitor nor have any control or input.
//         </Text>

//         <Text style={styles.paragraph}>
//           You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations, or conditions of any kind and any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools. Any use by you of optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).
//         </Text>

//         <Text style={styles.paragraph}>
//           We may also, in the future, offer new services and/or features through the website (including, the release of new tools and resources). Such new features and/or services shall also be subject to these Terms of Service.
//         </Text>

//         <Text style={styles.sectionTitle}>THIRD-PARTY LINKS</Text>
//         <Text style={styles.paragraph}>
//           Certain content, products, and services available via our Service may include materials from third parties.
//         </Text>

//         <Text style={styles.paragraph}>
//           Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or any other materials, products, or services of third parties.
//         </Text>

//         <Text style={styles.paragraph}>
//           We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third party.
//         </Text>

//         <Text style={styles.sectionTitle}>USER COMMENTS, FEEDBACK, AND OTHER SUBMISSIONS</Text>
//         <Text style={styles.paragraph}>
//           If at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials whether online, by email, by post, or otherwise (collectively, 'comments'), you agree that we may at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation:
//         </Text>

//         <View style={styles.bulletGroup}>
//           <Text style={styles.bulletPoint}>
//             • To maintain any comments in confidence
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To pay compensation for any comments
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To respond to any comments
//           </Text>
//         </View>

//         <Text style={styles.paragraph}>
//           We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion, as unlawful, offensive, a threat, libelous, defamatory, pornographic, obscene, or otherwise objectionable or violates any party's intellectual property or these Terms of Service.
//         </Text>

//         <Text style={styles.paragraph}>
//           You agree that your comments will not violate any right of any third party, including copyright, trademark, privacy, personality, or another personal or proprietary right. You further agree that your comments will not contain libelous or otherwise unlawful, abusive, or obscene material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related website. You may not use a false e-mail address, pretend to be someone other than yourself, or otherwise mislead us or third parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments posted by you or any third party.
//         </Text>

//         <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
//         <Text style={styles.paragraph}>
//           Your submission of personal information through the store is governed by our Privacy Policy.
//         </Text>

//         <Text style={styles.sectionTitle}>ERRORS, INACCURACIES, AND OMISSIONS</Text>
//         <Text style={styles.paragraph}>
//           Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies, or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times, and availability. We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).
//         </Text>

//         <Text style={styles.paragraph}>
//           We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related website should be taken to indicate that all information in the Service or on any related website has been modified or updated.
//         </Text>

//         <Text style={styles.sectionTitle}>PROHIBITED USES</Text>
//         <Text style={styles.paragraph}>
//           In addition to other prohibitions as outlined in the Terms of Service, you are prohibited from using the site or its content:
//         </Text>

//         <View style={styles.bulletGroup}>
//           <Text style={styles.bulletPoint}>
//             • For any unlawful purpose.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To solicit others to perform or participate in any unlawful acts.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To infringe upon or violate our intellectual property rights or the intellectual property rights of others.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To submit false or misleading information.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or any related website, other websites, or the internet.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To collect or track the personal information of others.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To spam, phish, pharm, pretext, crawl, scrape, or for any obscene or immoral purpose.
//           </Text>
//           <Text style={styles.bulletPoint}>
//             • To interfere with or circumvent the security features of the service or any related website, other websites, or the Internet. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
//           </Text>
//         </View>

//         <Text style={styles.sectionTitle}>LIABILITY</Text>
//         <Text style={styles.paragraph}>
//           In no case shall Earth Crust company be liable for any injury, loss/ claim, or any direct/ indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law.
//         </Text>

//         <Text style={styles.sectionTitle}>ENTIRE AGREEMENT</Text>
//         <Text style={styles.paragraph}>
//           The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.
//         </Text>

//         <Text style={styles.paragraph}>
//           These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitute the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications, and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).
//         </Text>

//         <Text style={styles.paragraph}>
//           Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.
//         </Text>

//         <Text style={styles.sectionTitle}>GOVERNING LAW</Text>
//         <Text style={styles.paragraph}>
//           These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed by the laws of Delhi, (IN) India.
//         </Text>

//         <Text style={styles.sectionTitle}>CHANGES TO TERMS OF SERVICE</Text>
//         <Text style={styles.paragraph}>
//           You can review the most current version of the Terms of Service at any time on this page.
//         </Text>

//         <Text style={styles.paragraph}>
//           We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes.
//         </Text>
//       </ScrollView>
//     </View>
//   );
// };

// export default TermsOfServiceScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF",
//   },
//   header: {
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + hp(1) : hp(5.5),
//     paddingBottom: hp(2.2 * SCALE),
//     paddingHorizontal: wp(5 * SCALE),
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   backButton: {
//     paddingRight: wp(3 * SCALE),
//   },
//   headerTitle: {
//     fontSize: RFValue(16 * SCALE),
//     fontWeight: "700",
//     color: "#222",
//   },
//   contentContainer: {
//     padding: wp(5),
//     paddingBottom: hp(5),
//   },
//   sectionTitle: {
//     fontSize: RFValue(15 * SCALE),
//     fontWeight: "700",
//     color: "#222",
//     marginTop: hp(2),
//     marginBottom: hp(1),
//   },
//   subTitle: {
//     fontSize: RFValue(14 * SCALE),
//     fontWeight: "600",
//     color: "#444",
//     marginBottom: hp(1),
//   },
//   paragraph: {
//     fontSize: RFValue(13.5 * SCALE),
//     color: "#444",
//     marginBottom: hp(1.2),
//     lineHeight: RFValue(21 * SCALE),
//   },
//   bulletGroup: {
//     marginLeft: wp(2),
//     marginBottom: hp(1.2),
//   },
//   bulletPoint: {
//     fontSize: RFValue(13.5 * SCALE),
//     color: "#444",
//     marginBottom: hp(0.8),
//     lineHeight: RFValue(21 * SCALE),
//   },
// });








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

const TermsOfServiceScreen = () => {
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
              Terms of Service
            </Text>
            <View style={styles.iconButtonRight} />
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
        <Text style={styles.subTitle}>OVERVIEW</Text>
        
        <Text style={styles.paragraph}>
          This website: https://letstryfoods.com/ is owned and operated by Earth Crust company. Throughout the site, the terms "we," "us" and "our" refer to Earth Crust company. The website including all the literature and information, tools, and services available from the site to you the user, is conditioned upon your acceptance of all terms, conditions, policies, and notices stated here and is offered to you by Earth Crust company.
        </Text>

        <Text style={styles.paragraph}>
          By visiting our site and/or purchasing from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
        </Text>

        <Text style={styles.paragraph}>
          Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, you may choose not to access the website or use any of its services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.
        </Text>

        <Text style={styles.paragraph}>
          Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
        </Text>

        <Text style={styles.sectionTitle}>ONLINE STORE TERMS</Text>
        <Text style={styles.paragraph}>
          You may not use our products for any illegal or unauthorized purpose nor may you in the use of the Service violate any laws in your jurisdiction (including, but not limited to copyright laws). You must not transmit any worms or viruses or any code of a destructive nature.
        </Text>

        <Text style={styles.paragraph}>
          A breach or violation of any of the Terms will result in an immediate termination of your Services.
        </Text>

        <Text style={styles.sectionTitle}>GENERAL CONDITIONS</Text>
        <Text style={styles.paragraph}>
          We reserve the right to refuse service to anyone for any reason at any time.
        </Text>

        <Text style={styles.paragraph}>
          You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to the technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.
        </Text>

        <Text style={styles.paragraph}>
          You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express wrote permission by us.
        </Text>

        <Text style={styles.paragraph}>
          The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
        </Text>

        <Text style={styles.sectionTitle}>ACCURACY, COMPLETENESS, AND TIMELINESS OF INFORMATION</Text>
        <Text style={styles.paragraph}>
          We are not responsible if the information made available on this site is not accurate, complete, or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate and complete, or more timely sources of information. Any reliance on the material on this site is at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>MODIFICATIONS TO THE SERVICE AND PRICES</Text>
        <Text style={styles.paragraph}>
          Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part or content thereof) without notice at any time.
        </Text>

        <Text style={styles.paragraph}>
          We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.
        </Text>

        <Text style={styles.sectionTitle}>PRODUCTS OR SERVICES</Text>
        <Text style={styles.paragraph}>
          Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Returns Policy.
        </Text>

        <Text style={styles.paragraph}>
          We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
        </Text>

        <Text style={styles.paragraph}>
          We reserve the right but are not obligated, to limit the sales of our products or Services to any person, geographic region, or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
        </Text>

        <Text style={styles.paragraph}>
          We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
        </Text>

        <Text style={styles.sectionTitle}>ACCURACY OF BILLING AND ACCOUNT INFORMATION</Text>
        <Text style={styles.paragraph}>
          We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. If we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/ phone number provided at the time the order was made. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.
        </Text>

        <Text style={styles.paragraph}>
          You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers, and expiration dates, so that we can complete your transactions and contact you as needed.
        </Text>

        <Text style={styles.paragraph}>
          For more details, please review our Returns Policy.
        </Text>

        <Text style={styles.sectionTitle}>OPTIONAL TOOLS</Text>
        <Text style={styles.paragraph}>
          We may provide you with access to third-party tools over which we neither monitor nor have any control or input.
        </Text>

        <Text style={styles.paragraph}>
          You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations, or conditions of any kind and any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools. Any use by you of optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).
        </Text>

        <Text style={styles.paragraph}>
          We may also, in the future, offer new services and/or features through the website (including, the release of new tools and resources). Such new features and/or services shall also be subject to these Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>THIRD-PARTY LINKS</Text>
        <Text style={styles.paragraph}>
          Certain content, products, and services available via our Service may include materials from third parties.
        </Text>

        <Text style={styles.paragraph}>
          Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or any other materials, products, or services of third parties.
        </Text>

        <Text style={styles.paragraph}>
          We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third party.
        </Text>

        <Text style={styles.sectionTitle}>USER COMMENTS, FEEDBACK, AND OTHER SUBMISSIONS</Text>
        <Text style={styles.paragraph}>
          If at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials whether online, by email, by post, or otherwise (collectively, 'comments'), you agree that we may at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation:
        </Text>

        <View style={styles.bulletGroup}>
          <Text style={styles.bulletPoint}>
            • To maintain any comments in confidence
          </Text>
          <Text style={styles.bulletPoint}>
            • To pay compensation for any comments
          </Text>
          <Text style={styles.bulletPoint}>
            • To respond to any comments
          </Text>
        </View>

        <Text style={styles.paragraph}>
          We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion, as unlawful, offensive, a threat, libelous, defamatory, pornographic, obscene, or otherwise objectionable or violates any party's intellectual property or these Terms of Service.
        </Text>

        <Text style={styles.paragraph}>
          You agree that your comments will not violate any right of any third party, including copyright, trademark, privacy, personality, or another personal or proprietary right. You further agree that your comments will not contain libelous or otherwise unlawful, abusive, or obscene material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related website. You may not use a false e-mail address, pretend to be someone other than yourself, or otherwise mislead us or third parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments posted by you or any third party.
        </Text>

        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
        <Text style={styles.paragraph}>
          Your submission of personal information through the store is governed by our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>ERRORS, INACCURACIES, AND OMISSIONS</Text>
        <Text style={styles.paragraph}>
          Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies, or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times, and availability. We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).
        </Text>

        <Text style={styles.paragraph}>
          We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related website should be taken to indicate that all information in the Service or on any related website has been modified or updated.
        </Text>

        <Text style={styles.sectionTitle}>PROHIBITED USES</Text>
        <Text style={styles.paragraph}>
          In addition to other prohibitions as outlined in the Terms of Service, you are prohibited from using the site or its content:
        </Text>

        <View style={styles.bulletGroup}>
          <Text style={styles.bulletPoint}>
            • For any unlawful purpose.
          </Text>
          <Text style={styles.bulletPoint}>
            • To solicit others to perform or participate in any unlawful acts.
          </Text>
          <Text style={styles.bulletPoint}>
            • To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
          </Text>
          <Text style={styles.bulletPoint}>
            • To infringe upon or violate our intellectual property rights or the intellectual property rights of others.
          </Text>
          <Text style={styles.bulletPoint}>
            • To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.
          </Text>
          <Text style={styles.bulletPoint}>
            • To submit false or misleading information.
          </Text>
          <Text style={styles.bulletPoint}>
            • To upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or any related website, other websites, or the internet.
          </Text>
          <Text style={styles.bulletPoint}>
            • To collect or track the personal information of others.
          </Text>
          <Text style={styles.bulletPoint}>
            • To spam, phish, pharm, pretext, crawl, scrape, or for any obscene or immoral purpose.
          </Text>
          <Text style={styles.bulletPoint}>
            • To interfere with or circumvent the security features of the service or any related website, other websites, or the Internet. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>LIABILITY</Text>
        <Text style={styles.paragraph}>
          In no case shall Earth Crust company be liable for any injury, loss/ claim, or any direct/ indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law.
        </Text>

        <Text style={styles.sectionTitle}>ENTIRE AGREEMENT</Text>
        <Text style={styles.paragraph}>
          The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.
        </Text>

        <Text style={styles.paragraph}>
          These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitute the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications, and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).
        </Text>

        <Text style={styles.paragraph}>
          Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.
        </Text>

        <Text style={styles.sectionTitle}>GOVERNING LAW</Text>
        <Text style={styles.paragraph}>
          These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed by the laws of Delhi, (IN) India.
        </Text>

        <Text style={styles.sectionTitle}>CHANGES TO TERMS OF SERVICE</Text>
        <Text style={styles.paragraph}>
          You can review the most current version of the Terms of Service at any time on this page.
        </Text>

        <Text style={styles.paragraph}>
          We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes.
        </Text>
      </ScrollView>
    </View>
  );
};

export default TermsOfServiceScreen;

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
  subTitle: {
    fontSize: RFValue(14 * SCALE),
    fontWeight: "600",
    color: "#444",
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
});