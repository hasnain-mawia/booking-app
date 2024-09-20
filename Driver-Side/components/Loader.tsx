import { View, Text, Image } from 'react-native'
import React from 'react'

const Loader = () => {
    return (
        <View className='bg-[#f0f0f0] h-full flex flex-col justify-center items-center'>
            <View className='flex flex-col gap-5 mx-auto'>
                <Image style={{ width: 60, height: 60 }} source={require('@/assets/images/Loader.gif')} />
                <Text>Please Wait....</Text>
            </View>
        </View>
    )
}

export default Loader