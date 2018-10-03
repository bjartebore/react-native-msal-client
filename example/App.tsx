import React from "react";
import { View, Button, StyleSheet } from "react-native";
import B2CLoginExample from "./B2CLoginExample";
import CommonLoginExample from "./CommonLoginExample";
import { createStackNavigator, NavigationScreenProp } from "react-navigation";

interface IProps {
  navigation: NavigationScreenProp<any>;
}
class HomeScreen extends React.Component<IProps> {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={styles.buttonContainerStyle}>
          <Button
            title="Common Example"
            onPress={() => this.props.navigation.navigate("CommonLoginExample")}
          />
        </View>
        <View style={styles.buttonContainerStyle}>
          <Button
            title="B2C Example"
            onPress={() => this.props.navigation.navigate("B2CLoginExample")}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainerStyle: {
    margin:10
  }
});

export default createStackNavigator({
  HomeScreen: HomeScreen,
  B2CLoginExample: {
    screen: B2CLoginExample,
    navigationOptions: () => ({
      title: "B2C Login Example",
      headerBackTitle: null
    })
  },
  CommonLoginExample: {
    screen: CommonLoginExample,
    navigationOptions: () => ({
      title: "Common Login Example",
      headerBackTitle: null
    })
  }
});
