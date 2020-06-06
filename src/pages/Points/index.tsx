import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { SvgUri } from "react-native-svg";
import { Feather as Icon } from "@expo/vector-icons";

import api from "../../services/api";

const Points = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Ooooops",
          "Precisamos de sua permissão para obter a localização"
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      setInitialPosition([latitude, longitude]);
    })();
  }, []);

  useEffect(() => {
    api
      .get("points", {
        params: {
          city: "Mata de São João",
          uf: "BA",
          items: [1, 2, 6],
        },
      })
      .then((response) => setPoints(response.data));
  }, []);

  useEffect(() => {
    api
      .get("items")
      .then((response) => response.data)
      .then((data: Item[]) => setItems(data));
  }, []);

  const handleSelectedItems = (id: number) => {
    const alreadySelected = selectedItems.findIndex((item) => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
      return;
    }
    setSelectedItems([...selectedItems, id]);
    return;
  };

  const handleMakersMap = () => {
    return points.map((point) => (
      <Marker
        key={String(point.id)}
        style={styles.mapMarker}
        coordinate={{ latitude: point.latitude, longitude: point.longitude }}
        onPress={() => handleNavigateToDetail(point.id)}
      >
        <View style={styles.mapMarkerContainer}>
          <Image
            style={styles.mapMarkerImage}
            source={{
              uri: point.image,
            }}
          />
          <Text style={styles.mapMarkerTitle}>{point.name}</Text>
        </View>
      </Marker>
    ));
  };

  const handleTouchableOpacityItem = () => {
    return items.map((item) => (
      <TouchableOpacity
        key={String(item.id)}
        style={[
          styles.item,
          selectedItems.includes(item.id) ? styles.selectedItem : {},
        ]}
        onPress={() => handleSelectedItems(item.id)}
      >
        <SvgUri width={42} height={42} uri={item.image_url}></SvgUri>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </TouchableOpacity>
    ));
  };

  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const handleNavigateToDetail = (id: number) => {
    navigation.navigate("Details", { point_id: id });
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34cb79" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
        </Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              {handleMakersMap()}
            </MapView>
          )}
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {handleTouchableOpacityItem()}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: "#34CB79",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: "cover",
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#eee",
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",

    textAlign: "center",
  },

  selectedItem: {
    borderColor: "#34CB79",
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: "Roboto_400Regular",
    textAlign: "center",
    fontSize: 13,
  },
});

interface Point {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
}

interface Item {
  id: number;
  title: string;
  image: string;
  image_url: string;
}

export default Points;
