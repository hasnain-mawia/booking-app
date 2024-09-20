import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, Image } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import styles from '@/styles/location';
import { collection, db, onSnapshot, query, rideRequest, where, } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Loaders from '@/components/Loader';


export default function HomeScreen() {
    const [location, setLocation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [rides, setRide] = useState<any>([])
    const [currentRides, setCurrentRides] = useState<any>(0);
    const [isVisible, setisVisible] = useState(false)
    const [Loader, setIsLoader] = useState(false)

    console.log(rides)

    useEffect(() => {
        getLocation()
        getRealtimeLocation()
    }, []);

    function nextRide() {
        // if (currentRides !== rides.length - 1) {
        //   setCurrentRides(currentRides + 1)
        // } else {
        //   setRide([])
        // }
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
            setRide(rides);
            setisVisible(true);
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

    const AcceptRide = async (item: any) => {
        setIsLoader(true)
        const riderReq = doc(db, "rides", item.id);
        await updateDoc(riderReq,
            { status: "Accepted" });
        setRide([...rides, item]);
        setisVisible(false);
        setIsLoader(false)
    };
    return Loader ? <Loaders /> : (
        <View style={styles.container}>
            <View className='flex-row items-center space-x-2 px-4 pb-2 mt-10'>
                <View className='flex-row flex-1 justify-center items-center p-2 rounded-full border-[2px] border-[#c4c4c4] px-4 pb-2'>
                    <Text className='text-[25px] font-bold text-[#696969]'>Driver</Text>
                </View>
            </View>
            {rides.length > 0 && rides[0].status == 'pending' && <Modal visible={isVisible}>
                <View className='m-5 bg-[#e5e5e5] rounded-2xl p-5 my-auto'>
                    <Text className='text-[20px] font-bold text-[#020202] text-center py-3'>Ride Request</Text>
                    <Image className='w-[150px] h-[150px] mx-auto mb-4'
                        source={require('@/assets/images/taxi.png')}
                    />
                    <View>
                        {rides.map((item: any, i: number) => {
                            return (
                                <View className='flex flex-col justify-center items-center mb-5 space-y-2' key={i}>
                                    <View className='border-2 border-[#c5c5c5] shadow-xl p-1 rounded-lg'>
                                        <Text className='text-[14px] font-bold text-[#000000] text-center'>Pickup Location</Text>
                                        <Text className='text-center'><Text className='text-[13px] font-bold text-[#030303]'>{item.pickup.pickupName}</Text> | {item.pickup.pickupAddress}</  Text>
                                    </View>
                                    <View className='border-2 border-[#c5c5c5] shadow-xl p-1 rounded-lg'>
                                        <Text className='text-[14px] font-bold text-[#000000] text-center'>DropOff Location</Text>
                                        <Text><Text className='text-[13px] font-bold text-[#030303] text-center'>{item.dropOff.dropOffName}</Text> | {item.dropOff.dropOffAddress}</ Text>
                                    </View>
                                    <View className='flex flex-row gap-3'>
                                        <TouchableOpacity onPress={() => AcceptRide(item)} className='bg-[#105817] p-3 text-[18px] rounded-full flex-1'>
                                            <Text className='text-white text-center text-[14px]'>Accept </Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => nextRide} className='bg-[#f02b2b] p-3 text-[18px] rounded-full flex-1'>
                                            <Text className='text-white text-center text-[14px]'>Reject</Text></TouchableOpacity>
                                    </View >
                                </View>
                            )
                        })}
                    </View>
                </View >
            </Modal>}

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
