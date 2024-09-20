import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, Image } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import styles from '@/styles/location';
import { collection, db, onSnapshot, query, rideRequest, where, } from '@/config/firebase';

export default function HomeScreen() {
    const [location, setLocation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [rides, setRide] = useState<any>([])
    const [currentRides, setCurrentRides] = useState<any>(0);
    // const [isVisible, setisVisible] = useState(false);

    useEffect(() => {
        getLocation()
        getRealtimeLocation()
    }, []);

    function nextRide() {
        if (currentRides !== rides.length - 1) {
            setCurrentRides(currentRides + 1)
        } else {
            setRide([])
        }
    }

    function getRealtimeLocation() {
        const q = query(collection(db, "rides"), where("status", "==", "pending"));
        onSnapshot(q, (querySnapshot) => {
            const rides: any = [];
            querySnapshot.forEach((doc) => {
                let Ride = doc.data();
                Ride.id = doc.id
                rides.push(Ride);
            });
            setRide(rides)
            // setisVisible(true)
        });
    }
    function getLocation() {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }

    // const AcceptRide = async (item: any) => {
    //     console.log(item.id)
    //     const updateRide = doc(db, "rides", item.id);
    //     await updateDoc(updateRide, { status: "Accepted" });
    //     setRide((prevrides: any) => prevrides.filter((rides: any) => rides.id === item.id));
    // };

    // const RejectedRide = async (item: any) => {
    //     const updateRide = doc(db, "rides", item.id);
    //     await updateDoc(updateRide, { status: "Rejected" });
    // };

    return (
        <View style={styles.container}>
            <View className='flex-row items-center space-x-2 px-4 pb-2 mt-10'>
                <View className='flex-row flex-1 justify-center items-center p-2 rounded-full border-[2px] border-[#c4c4c4] px-4 pb-2'>
                    <Text className='text-[25px] font-bold text-[#696969]'>Driver</Text>
                </View>
            </View>

            {!!rides.length &&
                <View className='flex flex-col space-y-2'>
                    <View className='bg-[#abd9fa] rounded-2xl p-3 mx-3'>
                        <Text className='text-[16px] font-bold text-[#ff2929]'>Pickup Location</Text>
                        <Text><Text className='text-[15px] font-bold text-[#030303]'>{rides[currentRides].pickup.pickupName}</Text> | {rides[currentRides].pickup.pickupAddress}</Text>
                    </View>
                    <View className='bg-[#abd9fa] rounded-2xl p-3 mx-3'>
                        <Text className='text-[16px] font-bold text-[#ff2929]'>Drop off Location</Text>
                        <Text><Text className='text-[15px] font-bold text-[#030303]'>{rides[currentRides].dropOff.dropOffName}</Text> | {rides[currentRides].dropOff.dropOffAddress}</Text>
                    </View>


                </View>
            }


            {!location ?
                <Text className='text-[22px]'>Please Wait</Text>
                :
                rides.map((item: any, i: number) => {
                    return (
                        <MapView key={i} region={{
                            latitude: Number(item.pickup.pickupLatitude),
                            longitude: Number(item.pickup.pickupLongitude),
                            latitudeDelta: 0.16,
                            longitudeDelta: 0.16,
                        }} style={styles.map}

                        >

                            <Marker
                                coordinate={{
                                    latitude: Number(item.pickup.pickupLatitude),
                                    longitude: Number(item.pickup.pickupLongitude),
                                }}
                                title={'Pickup Location'}
                                description={item.pickup.pickupAddress}
                            />

                            <Marker
                                coordinate={{
                                    latitude: Number(item.dropOff.dropOfflatitude),
                                    longitude: Number(item.dropOff.dropOfflongitude),
                                }}
                                title={'DropOff Location'}
                                description={item.dropOff.dropOffAddress}
                            />
                            <Circle fillColor='e0f5ff' radius={400} strokeColor='green' center={{
                                latitude: Number(item.pickup.pickupLatitude),
                                longitude: Number(item.pickup.pickupLongitude)
                            }} />
                            <Circle fillColor='e0f5ff' radius={400} strokeColor='red' center={{
                                latitude: Number(item.dropOff.dropOfflatitude),
                                longitude: Number(item.dropOff.dropOfflongitude)
                            }} />

                            <Polyline
                                strokeColor='red'
                                strokeWidth={2}
                                lineCap='round'
                                lineDashPhase={2}
                                coordinates={[
                                    {
                                        latitude: Number(item.pickup.pickupLatitude),
                                        longitude: Number(item.pickup.pickupLongitude)
                                    },
                                    {
                                        latitude: Number(item.dropOff.dropOfflatitude),
                                        longitude: Number(item.dropOff.dropOfflongitude)
                                    },
                                ]}
                            />
                        </MapView>
                    )
                })
            }

        </View >
    );
}

