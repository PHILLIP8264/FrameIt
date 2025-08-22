import { Alert, Linking } from "react-native";
import { APP_INFO } from "../constants/aboutData";

export const useAbout = () => {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link");
    });
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${APP_INFO.supportEmail}`).catch(() => {
      Alert.alert("Error", "Could not open email client");
    });
  };

  const showVersionInfo = () => {
    Alert.alert(
      "Version Information",
      `Version: ${APP_INFO.version}\nBuild: ${APP_INFO.buildNumber}\nRelease: ${APP_INFO.releaseDate}`,
      [{ text: "OK" }]
    );
  };

  const openWebsite = () => openLink(APP_INFO.website);
  const openPrivacyPolicy = () => openLink(APP_INFO.privacyPolicy);
  const openTermsOfService = () => openLink(APP_INFO.termsOfService);

  return {
    openLink,
    openEmail,
    showVersionInfo,
    openWebsite,
    openPrivacyPolicy,
    openTermsOfService,
  };
};
