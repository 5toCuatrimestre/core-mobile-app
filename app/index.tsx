import { black, white } from "colors";
import { Alert, Text, View, Image, StyleSheet, TextInput,TouchableOpacity } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Image source={{uri:"https://static.vecteezy.com/system/resources/previews/022/123/337/non_2x/user-icon-profile-icon-account-icon-login-sign-line-vector.jpg"}} style={styles.image}></Image>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput style={styles.input} placeholder="Correo"></TextInput>
      <TextInput style={styles.input} placeholder="Contraseña"></TextInput>
      <TouchableOpacity style={styles.button}onPress={()=>Alert.alert("Entrando...")}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:"white"
  },
  title: {
    fontSize: 30,
    color:"black"
  },
  image:{
    height:100,
    width:100
  },
  button:{
    width:100,
    backgroundColor:"black",
    padding:7,
    marginTop:10,
    alignItems: "center",
    borderRadius:5
  },
  buttonText:{
    color:"white"
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  }
});
