import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, Image, TextInput, TouchableOpacity, Modal, Pressable, Alert, ScrollView, Button } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import styles from '@/styles/location';
import * as Icon from "react-native-feather";
import { router } from 'expo-router';


export default function HomeScreen() {
    const [location, setLocation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [searchResult, setSearchResult] = useState<any>();
    const [PickupLocation, setPickupLocation] = useState<any>();

    // console.log(PickupLocation.geocodes.main.latitude)
    // console.log(PickupLocation.geocodes.main.longitude)

    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    const findPickupLocation = (text: any) => {
        const { latitude, longitude } = location.coords;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'fsq3Y6alHrxpmxdkhupZAJFh7YlvcT0e+R9VwejiZjzsQDI='
            }
        };

        fetch(`https://api.foursquare.com/v3/places/search?query=${text}&ll=${latitude},${longitude}&radius=20000`, options)
            .then(response => response.json())
            .then(response => setSearchResult(response.results))
            .catch(err => console.error(err));
    }

    return (
        <View style={styles.container}>
            <View className='flex-row items-center space-x-2 px-4 pb-2 mt-10'>
                <View className='flex-row flex-1 items-center p-2 rounded-full border-[2px] border-[#c4c4c4] px-4 pb-2'>
                    <Icon.Search height="20px" width="20" stroke='#c4c4c4' />
                    <TextInput value={searchResult} onChangeText={findPickupLocation} placeholder='Search Ride' className='ml-1 flex-1' />
                    <View className='flex-row items-center space-x-1 border-0 border-l-2 pl-2 border-[#c4c4c4]'>
                        {searchResult && searchResult.length > 0 ? <TouchableOpacity className='bg-[#616060] rounded-full p-1' onPress={() => setSearchResult('')}><Icon.X height="20px" width="20" stroke='#fff' /></TouchableOpacity> : <Icon.MapPin height="20px" width="20" stroke='#3c3c3c' />}
                    </View>
                </View>
            </View>

            <View className='px-10 py-1 rounded-full'>
                {searchResult && searchResult.map((item: any, i: any) => {
                    return (
                        <TouchableOpacity onPress={() => setPickupLocation(item)} key={i} className='border-b-2 border-[#dadada] py-2'>
                            <Text>{item?.name} | {item?.location.formatted_address}</Text>
                        </TouchableOpacity>
                    )
                })
                }
            </View>

            {PickupLocation &&
                <View className='bg-[#abd9fa] rounded-2xl p-3 mx-3'>
                    <TouchableOpacity className='flex items-end' onPress={() => setPickupLocation('')}><Icon.X height="30px" width="30" stroke='#ff2929' /></TouchableOpacity>
                    <Text className='text-[15px] font-bold text-[#ff2929]'>Pickup Location Selected:</Text>
                    <Text> {PickupLocation.name}  {PickupLocation.location.formatted_address}</Text>
                </View>}

            {!PickupLocation ? <TouchableOpacity disabled className='bg-[#bababa] px-3 py-2 text-[18px] m-3 rounded-full'><Text className='text-white text-center'>Drop Off</Text></TouchableOpacity>
                :
                <TouchableOpacity className='bg-[#209df7] px-3 py-2 text-[18px] m-3 rounded-full' onPress={() => router.push({
                    pathname: '/dropoff', params: {
                        name: PickupLocation.name,
                        address: PickupLocation.location.formatted_address,
                        latitude: PickupLocation.geocodes.main.latitude,
                        longitude: PickupLocation.geocodes.main.longitude
                    }
                })}><Text className='text-white text-center'>Drop Off</Text></TouchableOpacity>}

            {!location ?
                <Text className='text-[22px]'>Please Wait</Text>
                : <MapView region={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.16,
                    longitudeDelta: 0.16,
                }} style={styles.map}>

                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title={PickupLocation?.name}
                        description={PickupLocation?.location.address}
                    />
                </MapView>}
        </View >
    );
}

