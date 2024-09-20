import { useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView, Alert, Modal, RefreshControl } from 'react-native';
import styles from '@/styles/location';
import { useLocalSearchParams } from 'expo-router';
import Transport from '@/constants';
import { rideRequest, query, db, collection, onSnapshot, where, } from '@/config/firebase'

export default function HomeScreen() {
    const params = useLocalSearchParams();
    const [fare, setfare] = useState<any>();
    const [vehicle, setVehicle] = useState();
    const [spinBtn, setSpinBtn] = useState(false)
    const { pickupLatitude, pickupLongitude, dropOfflatitude, dropOfflongitude, pickupName, pickupAddress, dropOffName, dropOffAddress } = params;
    const [activeproducts, setactiveProducts] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [rides, setRide] = useState<any>([])

    console.log(rides)
    useEffect(() => {
        getRealtimeLocation()
    }, []);


    function selectedTransport(value) {
        const baseFare = value.rupees;
        setVehicle(value.name)
        const distance = calcCrow(pickupLatitude, pickupLongitude, dropOfflatitude, dropOfflongitude)
        const fare = baseFare * distance
        setfare(Math.round(fare))
        setactiveProducts(value.id);
    }

    function calcCrow(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = toRad(lat2 - lat1);
        var dLon = toRad(lon2 - lon1);
        var lat1 = toRad(lat1);
        var lat2 = toRad(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    function toRad(Value) {
        return Value * Math.PI / 180;
    }

    function getRealtimeLocation() {
        const q = query(collection(db, "rides"), where("status", "==", "pending"));
        onSnapshot(q, (querySnapshot) => {
            const ride: any = [];
            querySnapshot.forEach((doc) => {
                ride.push(doc.data().status);
            });
            setRide([...ride])
        });
    }

    async function sendRide() {

        setSpinBtn(true)
        const ride = {
            pickup: {
                pickupLatitude,
                pickupLongitude,
                pickupName,
                pickupAddress,
            },
            dropOff: {

                dropOfflongitude,
                dropOfflatitude,
                dropOffName,
                dropOffAddress
            },
            fare,
            vehicle,
            status: 'pending',
        }
        try {
            await rideRequest(ride)
            setIsVisible(true);
            setTimeout(() => {
                setIsVisible(false)
            }, 2000);
            setSpinBtn(false)
        } catch (e: any) {
            Alert.alert(e.message);
        }
    }

    const getBtnStyle = () => {
        if (rides[0] === "Accepted") {
            return [styles.acceptButton]
        } else if (rides[0] === "pending") {
            return [styles.pendingButton];
        } else if (rides[0] === "Rejected") {
            return [styles.rejectButton];
        }
        return "Find Ride";
    };

    // function getButtonText() {
    //     if (rides[0] === "Accepted") {
    //         if (rides[0] === "Rejected") {
    //         return "Cancelled";}
    //         else {
    //         return "Go to Ride";}
    // }
    // return "Your Driver Is Ready";
    // };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={true} />
                }
            ></ScrollView>

            {isVisible &&
                <Modal visible={isVisible}>
                    <View className='m-5 bg-[#e5e5e5] rounded-2xl p-5 my-auto'>
                        <Image className='w-[150px] h-[150px] mx-auto mb-4'
                            source={require('@/assets/images/Check.gif')}
                        />
                        <View>
                            <View className='flex flex-col justify-center items-center mb-5 space-y-2'>
                                <View className='flex flex-col'>
                                    <Text className='text-[20px] font-bold text-[#000000] text-center'>Ride Request Sended</Text>
                                    <Text className='text-[20px] font-bold text-[#000000] text-center'>Your Total Amount is Rs: {fare}</Text>
                                </View>
                            </View>
                        </View >
                    </View >
                </Modal>
            }
            <View className='flex-row gap-2 w-[100%] px-2 my-2'>
                {params &&
                    <View className='bg-[#209df7] shadow-2xl rounded-2xl p-3 flex-1'>
                        <Text className='text-[15px] font-bold bg-white rounded-full text-center text-[#000000]'>Pickup Location</Text>
                        <Text className='text-[#ffffff] font-bold pt-3 border-b-[1px] border-black py-1'> {pickupName}</Text>
                        <Text className='text-[#ffffff]'> {pickupAddress}</Text>
                    </View>
                }
                {params &&
                    <View className='bg-[#209df7] shadow-2xl rounded-2xl p-3 flex-1'>
                        <Text className='text-[15px] font-bold bg-white rounded-full text-center text-[#000000]'>DropOff Location</Text>
                        <Text className='text-[#ffffff] font-bold pt-3 border-b-[1px] border-black py-1'> {dropOffName}</Text>
                        <Text className='text-[#ffffff]'> {dropOffAddress}</Text>
                    </View>}
            </View>
            <ScrollView horizontal={false}>

                <View className='flex flex-col m-4 space-y-2'>
                    {Transport.map((item: any, index: number) => {
                        let isActive = item.id == activeproducts;
                        let btnClass = isActive ? 'bg-gray-500' : 'bg-[#209df7]';
                        return (
                            <TouchableOpacity key={index} onPress={() => selectedTransport(item)}>
                                <View className={`${btnClass} flex flex-row justify-between items-center p-3 rounded-2xl`}>
                                    <View className='flex flex-col'>
                                        <Text className='text-[#080808] text-[12px] bg-white px-1 rounded-full'>{item.person} Person Space</Text>
                                        <Text className='text-white text-[20px]'>{item.name}</Text>
                                    </View>
                                    <View className='text-white bg-black p-3 rounded-full flex flex-col items-center justify-center'>
                                        <Text className='text-[15px] text-white'>Rs:{item.rupees}</Text>
                                        <Text className='text-white text-[10px]'>Per/KM</Text>
                                    </View>
                                    <Image className='w-[50px] h-[50px]' source={item.image} />
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
            <View className='flex flex-row gap-2 m-3'>
                <View className='bg-gray-500 p-3 text-[18px] rounded-full flex-0.5'>
                    <Text className='text-[15px] text-white'>Total Amount : <Text className={`${fare ? 'text-[#5af62f] font-bold' : null} `}>{fare ? fare : 0}</Text></Text>
                </View>
                {!activeproducts ?
                    <TouchableOpacity disabled={true} className='bg-[#d2d2d2] p-3 text-[18px] rounded-full flex-1'>
                        <Text className='text-white text-center text-[16px]'>Ready To Go</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={getBtnStyle()} onPress={sendRide} className='bg-[#209df7] p-3 text-[18px] rounded-full flex-1'>
                        <Text className='text-white text-center text-[16px]'>{spinBtn ? "Please Wait..." : (rides[0] === "pending" ? "Processing..." : (rides[0] === "Accepted" ? "Driver is Ready" : "Ready To Go"))}</Text>
                    </TouchableOpacity>
                }
            </View>

        </View>
    );
}
