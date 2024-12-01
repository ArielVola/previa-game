import React from 'react'
import { Text, View } from 'react-native';
import styles from './styles';
import { CardProperties } from '@/app/interfaces/CardProps.interface';

const Card = ({ challenge }: CardProperties) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{challenge}</Text>
    </View>
  )
}

export default Card;