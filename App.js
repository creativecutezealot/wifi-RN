import React, { Component } from "react";
import {
  View, Text, StyleSheet, StatusBar, SafeAreaView, TextInput, TouchableOpacity,
  Platform, PermissionsAndroid, Alert, Keyboard, DevSettings , AsyncStorage
} from "react-native";
import { colors, messages } from "./styles";
//import WifiManager from 'react-native-wifi-reborn';
import WifiManager  from 'react-native-wifi-manager';
import GlobalValidations from "./utils/GlobalValidation";
import { getData, saveData } from "./utils/AsyncStorageHelper";

import { NetworkInfo } from "react-native-network-info";
import TcpSocket from 'react-native-tcp-socket';

const WIFI_DATA = "wifi_data"
// let server = null
// let client = null
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneIp: '0.0.0.0',
      routerIp: '0.0.0.0',
      message: messages.MSG_CONNECT_YOUR_PHONE,
      ssid: 'TP-LINK_9D8B',
      password: '1122334455',
      server: null,
      client: null
    }
  }

  async componentDidMount() {
    getData(WIFI_DATA, data => {
      if (data != null) {
        /*this.setState({
          ssid: data.ssid,
          password: data.password
        }, async () => {
          // const enabled = await WifiManager.connectionStatus();
          // console.log('connectionStatus :>> ', enabled);

          //Auto connect
          this.connectWithWifi(false)
        })*/
      }
    });
    
    NetworkInfo.getIPV4Address().then(async (ipv4Address) => {
      if (ipv4Address) {
        this.setState({ phoneIp: ipv4Address })
        
      }
        
    });

    // Get Default Gateway IP
    NetworkInfo.getGatewayIPAddress().then(async (defaultGateway) => {
      let {client, server} = this.state
      console.log(defaultGateway)
      if (defaultGateway) {
        this.setState({ routerIp: defaultGateway })

        server = await TcpSocket.createServer(function(socket) {
          socket.on('data', data => {
            if(data) {
              let result = JSON.parse(data)
              Alert.alert("Wifi Config", "SSID: " + result.ssid + " Password: " + result.password)
            }
            
          });
          socket.on('error', (error) => {
            console.log('An error ocurred with client socket ', error);
          });
         
          socket.on('close', (error) => {
            console.log('Closed connection with ', socket.address());
          });

        }).listen({ port: 27017, host: "127.0.0.1" });

        server.on('error', (error) => {
          console.log('An error ocurred with the server', error);
        });
         
        server.on('close', () => {
          console.log('Server closed connection');
        });

        // client = await TcpSocket.createConnection({ port: 27017, host: defaultGateway }, () => {
        // });

        // client.on('data', function(data) {
        //   console.log('message was received', data);
        // });
         
        // client.on('error', function(error) {
        //   console.log(error);
        // });
         
        // client.on('close', function(){
        //   console.log('Connection closed!');
        // });

        this.setState({ message: "App reaady for connect", client, server });
      }
    });
  }

  componentWillUnmount() {
    if (!GlobalValidations.isFieldEmpty(this.state.ssid))
      WifiManager.isRemoveWifiNetwork(this.state.ssid)
  }

  relaunchApp = async () => {
    // if (!GlobalValidations.isFieldEmpty(this.state.ssid))
    //   WifiManager.isRemoveWifiNetwork(this.state.ssid)
    // DevSettings.reload()

    let {client, server, defaultGateway} = this.state

    client = await TcpSocket.createConnection({ port: 27017, host: defaultGateway }, () => {
    });

    client.on('data', function(data) {
      console.log('message was received', data);
    });
     
    client.on('error', function(error) {
      console.log(error);
    });
     
    client.on('close', function(){
      console.log('Connection closed!');
    });

    this.setState({client, server});
  }

  connectWithWifi = async (showMessage) => {

    console.log("send button clicked")
  
    Keyboard.dismiss()
    const { ssid, password } = this.state
    
    if (this.isValid(ssid, password, showMessage)) {
      const data = { ssid, password }
      saveData(WIFI_DATA, data, success => { }, failure => { })
      if (Platform.OS === 'ios') {
        try {
          const data = await WifiManager.connect(ssid, password);
          //console.log('Connected successfully!', { data });
          this.setState({ message: messages.MSG_RECEIVED_MSG_SUCCESSFULLY });

          this.setIp(showMessage)
        } catch (error) {
          this.setState({ message: error.message });
          console.log('Connection failed!', { error });
        }
      } else {
        //WifiManager.setEnabled(true);
        
        WifiManager.connect(ssid, password)
        WifiManager.status((status) => {
          // console.log("app status : ", status)
          if(status == 'CONNECTED') {
            this.setState({ message: messages.MSG_RECEIVED_MSG_SUCCESSFULLY });            
            this.setIp(showMessage)
          } else {

          }
        });
          /*.then(() => {
            this.setState({ message: messages.MSG_RECEIVED_MSG_SUCCESSFULLY });
            
            this.setIp(showMessage)
          }, (reason) => {
            this.setState({ message: reason.message });
            console.log("connectToProtectedSSID failed!");
            console.log(reason);
          }
        );  */  
          
      }
    }
  };

  setIp = (showMessage) => {
    let {client, server} = this.state

    // Get Local IP
    // NetworkInfo.getIPAddress().then(ipAddress => {
    //   console.log(ipAddress);
    //   newState.phoneIp = ipAddress
    // });

    // Get IPv4 IP (priority: WiFi first, cellular second)
    NetworkInfo.getIPV4Address().then(async (ipv4Address) => {
      if (ipv4Address) {
        this.setState({ phoneIp: ipv4Address })
        if(showMessage) {
          let wifi_config = {
            ssid: this.state.ssid,
            password: this.state.password
          }
          client.write(JSON.stringify(wifi_config))
        }
      }
        
    });

    // Get Default Gateway IP
    NetworkInfo.getGatewayIPAddress().then(defaultGateway => {
      console.log("Hello3:", defaultGateway);
      if (defaultGateway) {
        this.setState({ routerIp: defaultGateway })
      }
    });
  }

  isValid = (ssid, password, showMessage) => {
    if (GlobalValidations.isFieldEmpty(ssid)) {
      if (showMessage)
        this.showAlert(messages.VALIDATE_SSID_REQUIRED)
      return false
    } else if (GlobalValidations.isFieldEmpty(password)) {
      if (showMessage)
        this.showAlert(messages.VALIDATE_WIFI_PASSWORD_INVALID)
      return false
    }

    return true
  }

  async createSocketServer(ip){
    
  }

  async createSocketClient(ip) {
    
  }

  showAlert = (msg) => {
    Alert.alert(
      messages.APP_NAME,
      "" + msg,
      [
        {
          text: "OK",
          onPress: () => { }
        }
      ],
      {
        cancelable: false
      }
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.buttonBg} translucent={false} hidden={false} />
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.toolbarText}>{messages.APP_NAME}</Text>
          </View>
          <View style={styles.separator} />
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={styles.ipText}>{messages.MSG_PHONE_IP}
              <Text>{this.state.phoneIp}</Text>
            </Text>
            <Text style={styles.ipText}>{messages.MSG_Router_IP}
              <Text>{this.state.routerIp}</Text>
            </Text>
            <Text style={[styles.ipText, { marginVertical: 10 }]}>{this.state.message}
              {/* <Text>{this.state.message}</Text> */}
            </Text>

            <TextInput
              style={styles.textInputStyle}
              placeholder={messages.HINT_WIFI_NAME}
              // placeholderTextColor={colors.hintTI}
              value={this.state.ssid}
              underlineColorAndroid="transparent"
              autoCorrect={false}
              onChangeText={ssid => {
                this.setState({ ssid });
              }}
            />

            <TextInput
              style={styles.textInputStyle}
              placeholder={messages.HINT_WIFI_PASSWORD}
              // placeholderTextColor={colors.hintTI}
              value={this.state.password}
              underlineColorAndroid="transparent"
              autoCorrect={false}
              onChangeText={password => {
                this.setState({ password });
              }}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.buttonStyle, { marginRight: 5 }]} onPress={this.relaunchApp}>
                <Text style={styles.buttonText}>{messages.ACTION_CONNECT}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonStyle, { marginLeft: 5 }]} onPress={() => this.connectWithWifi(true)}>
                <Text style={styles.buttonText}>{messages.ACTION_SEND}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.buttonBg,
  },
  innerContainer: {
    backgroundColor: colors.white,
    flex: 1
  },
  headerContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toolbarText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
  },
  ipText: {
    color: colors.black,
    fontSize: 15,
  },
  textInputStyle: {
    borderColor: colors.separator,
    borderWidth: 1,
    borderRadius: 20,
    height: 40,
    fontSize: 16,
    color: colors.fontGreen,
    marginTop: 16,
    textAlignVertical: 'center',
    paddingHorizontal: 15
  },
  buttonContainer: {
    flexDirection: 'row', marginTop: 20
  },
  buttonStyle: {
    backgroundColor: colors.buttonBg,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: 20,
    height: 40
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 18,
  }
});