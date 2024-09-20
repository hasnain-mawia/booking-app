import { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import styles from '@/styles/location';
import * as Icon from "react-native-feather";
import { router, useLocalSearchParams } from 'expo-router';


export default function HomeScreen() {
    const params = useLocalSearchParams();
    const [location, setLocation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [searchResult, setSearchResult] = useState<any>();
    const [DropOffLocation, setDropOffLocation] = useState<any>();

    console.log(params)

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

    const findDropOffLocation = (text: any) => {
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
            <View className='flex-row items-center space-x-2 px-4 pb-2 mt-2'>
                <View className='flex-row flex-1 items-center p-2 rounded-full border-[2px] border-[#c4c4c4] px-4'>
                    <Icon.Search height="20px" width="20" stroke='#c4c4c4' />
                    <TextInput value={searchResult} onChangeText={findDropOffLocation} placeholder='Search Ride' className='ml-1 flex-1' />
                    <View className='flex-row items-center space-x-1 border-0 border-l-2 pl-2 border-[#c4c4c4]'>
                        {searchResult && searchResult.length > 0 ? <TouchableOpacity className='bg-[#616060] rounded-full p-1' onPress={() => setSearchResult('')}><Icon.X height="20px" width="20" stroke='#fff' /></TouchableOpacity> : <Icon.MapPin height="20px" width="20" stroke='#3c3c3c' />}
                    </View>
                </View>
            </View>

            <View className='px-10 py-1 rounded-full'>
                {searchResult && searchResult.map((item: any, i: any) => {
                    return (
                        <TouchableOpacity onPress={() => setDropOffLocation(item)} key={i} className='border-b-2 border-[#dadada] py-2'>
                            <Text>{item.name} | {item.location.formatted_address}</Text>
                        </TouchableOpacity>
                    )
                })
                }
            </View>
            {

            }
            <View className='space-y-2'>
                {params &&
                    <View className='bg-[#abd9fa] rounded-2xl p-3 mx-3'>
                        <Text className='text-[15px] font-bold text-[#ff2929]'>Pickup Location Selected:</Text>
                        <Text> {params.name} | {params.address}</Text>
                    </View>
                }
                {DropOffLocation &&
                    <View className='bg-[#abd9fa] rounded-2xl p-3 mx-3'>
                        <View><TouchableOpacity className='flex items-end' onPress={() => setDropOffLocation('')}><Icon.X height="30px" width="30" stroke='#ff2929' /></TouchableOpacity>
                        </View>
                        <View>
                            <Text className='text-[15px] font-bold text-[#ff2929]'>Drop Off Location Selected:</Text>
                            <Text> {DropOffLocation?.name} | {DropOffLocation.location?.formatted_address}</Text>
                        </View>
                    </View>
                }
            </View>

            <TouchableOpacity className='bg-[#209df7] px-3 py-2 text-[18px] m-3 rounded-full' onPress={() => router.push({
                pathname: '/carSelection', params: {
                    pickupName: params.name,
                    pickupAddress: params.address,
                    pickupLatitude: params.latitude,
                    pickupLongitude: params.longitude,
                    dropOffName: DropOffLocation.name,
                    dropOffAddress: DropOffLocation.location.formatted_address,
                    dropOfflatitude: DropOffLocation.geocodes.main.latitude,
                    dropOfflongitude: DropOffLocation.geocodes.main.longitude,
                }
            })}>
                <Text className='text-white text-center p-1 text-[16px]'>Select Ride</Text>
            </TouchableOpacity>
            {!!params.length ? <Text className='text-black text-center p-1 text-[16px]'>Please Wait....</Text> : <MapView region={{
                latitude: Number(params.latitude),
                longitude: Number(params.longitude),
                latitudeDelta: 0.16,
                longitudeDelta: 0.16,
            }} style={styles.map}>

                <Marker
                    coordinate={{
                        latitude: Number(params.latitude),
                        longitude: Number(params.longitude),
                    }}
                    title={params.name}
                    description={params.address}
                />
                {DropOffLocation && <Marker
                    coordinate={{
                        latitude: Number(DropOffLocation.geocodes.main.latitude),
                        longitude: Number(DropOffLocation.geocodes.main.longitude),
                    }}
                    title={DropOffLocation.name}
                    description={DropOffLocation.location.formatted_address}
                />}

                <Circle fillColor='e0f5ff' radius={200} strokeColor='green' center={{
                    latitude: Number(params.latitude),
                    longitude: Number(params.longitude)
                }} />

                {DropOffLocation && <Circle fillColor='e0f5ff' radius={200} strokeColor='red' center={{
                    latitude: Number(DropOffLocation.geocodes.main.latitude),
                    longitude: Number(DropOffLocation.geocodes.main.longitude)
                }} />}

                {DropOffLocation && <Polyline
                    strokeColor='red'
                    strokeWidth={2}
                    lineCap='round'
                    lineDashPhase={2}
                    coordinates={[
                        {
                            latitude: Number(params.latitude),
                            longitude: Number(params.longitude)
                        },
                        {
                            latitude: Number(DropOffLocation.geocodes.main.latitude),
                            longitude: Number(DropOffLocation.geocodes.main.longitude)
                        },
                    ]}
                />}

            </MapView>}
        </View>
    );
}

