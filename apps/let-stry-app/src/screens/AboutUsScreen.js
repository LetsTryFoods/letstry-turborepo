


import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    StatusBar,
} from "react-native";
// ✅ FIX: Kept MaterialIcons for the list, and added Ionicons for the header
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCALE = 0.87;

const AboutUsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const policies = [
        { title: "Privacy policy", screen: "PrivacyPolicyScreen" },
        { title: "Terms & Conditions", screen: "TermsOfServiceScreen" },
        { title: "Refund & Cancellations", screen: "RefundScreen" },
    ];

    const icons = [
        require("../assets/about/1.png"),
        require("../assets/about/2.png"),
        require("../assets/about/3.png"),
        require("../assets/about/4.png"),
        require("../assets/about/5.png"),
        require("../assets/about/6.png"),
    ];

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
                            About Us
                        </Text>
                        <View style={styles.iconButtonRight} />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.paragraph}>
                    When we found that our kid is only eating snacks that were made with
                    harmful ingredients. We started making snacks in our home by infusing
                    high-quality ingredients.
                </Text>

                <Text style={styles.paragraph}>
                    Soon in 2021 we launched "Let's Try" with the purpose to provide
                    better products with high-quality ingredients.
                </Text>

                <Text style={styles.paragraph}>
                    At Let's Try, we believe healthy snacking can be fun too. We follow
                    traditional methods to make all our snacks, just like your grandma
                    used to. We use 100% groundnut oil. No preservatives, no artificial
                    flavours, or colours, no trans fats or cholesterol. We have a large
                    variety of snacks, all of which have a unique taste and flavour. Our
                    products are tastier and healthier than other junk food and can be
                    consumed by anyone.
                </Text>

                <View style={styles.uspSection}>
                    <Text allowFontScaling={false} style={styles.uspTitle}>
                        Why to choose us?
                    </Text>
                    <View style={styles.iconGrid}>
                        <View style={styles.iconRow}>
                            {icons.slice(0, 3).map((iconSource, index) => (
                                <Image
                                    key={index}
                                    source={iconSource}
                                    style={styles.iconImage}
                                    resizeMode="contain"
                                />
                            ))}
                        </View>
                        <View style={styles.iconRow}>
                            {icons.slice(3, 6).map((iconSource, index) => (
                                <Image
                                    key={index + 3}
                                    source={iconSource}
                                    style={styles.iconImage}
                                    resizeMode="contain"
                                />
                            ))}
                        </View>
                    </View>
                </View>
                
                <Text style={styles.paragraph}>
                    Here at Let's Try we believe that good snacks don't have to be
                    expensive. Our prices fit almost any budget, so you can enjoy the
                    convenience of home delivered snacks, while saving money.
                </Text>

                <View style={styles.policyList}>
                    {policies.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.policyItem}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <Text style={[styles.policyText, styles.boldText]}>{item.title}</Text>
                            <Icon
                                name="chevron-right"
                                size={RFValue(20 * SCALE)}
                                color="#aaa"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    /* Header Styles */
    // ✅ FIX: Replaced old header styles with the new ones.
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

    /* Content Styles */
    contentContainer: {
        padding: wp(5 * SCALE),
    },
    paragraph: {
        fontSize: RFValue(14 * SCALE),
        color: "#333",
        marginBottom: hp(2 * SCALE),
        lineHeight: RFValue(21 * SCALE),
    },
    uspSection: {
        backgroundColor: "#FFDFAB",
        borderRadius: 15,
        padding: wp(4 * SCALE),
        marginBottom: hp(2 * SCALE),
        marginTop: hp(1.5),
    },
    uspTitle: {
        fontSize: RFValue(16 * SCALE),
        fontWeight: "700",
        color: "#222",
        textAlign: 'center',
        marginBottom: hp(2.5 * SCALE),
    },
    iconGrid: {},
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: hp(1.5 * SCALE),
    },
    iconImage: {
        width: wp(25 * SCALE),
        height: wp(25 * SCALE),
    },
    policyList: {
        marginTop: hp(1.5 * SCALE),
    },
    policyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: hp(2 * SCALE),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    policyText: {
        fontSize: RFValue(15 * SCALE),
        color: "#111",
    },
    boldText: {
        fontWeight: 'bold',
    },
});