import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Vibration  } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import Card from '@/components/card';
import { challengesData } from '../data/data';
import { Challenge } from '../interfaces/Challenges.interface';

const App = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [remainingChallenges, setRemainingChallenges] = useState(challengesData);
  const [circles, setCircles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const touchIds = useRef(new Map());
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const animationActive = useRef(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const winnerScale = useSharedValue(1);

  const handleTouchStart = (evt: any) => {
    const touches = evt.nativeEvent.touches;
  
    Array.from(touches).forEach((touch: any) => {
      if (!touchIds.current.has(touch.identifier)) {
        const id = touch.identifier;
        touchIds.current.set(id, { x: touch.locationX, y: touch.locationY });
  
        setCircles((prevCircles) => [
          ...prevCircles,
          { id, x: touch.locationX, y: touch.locationY },
        ]);
  
        Vibration.vibrate(5);
      }
    });

    if (touchIds.current.size >= 2 && !holdTimer.current) {
      startAnimations();
      holdTimer.current = setTimeout(() => {
        selectWinner();
        stopAnimations();
        holdTimer.current = null;
      }, 2000);
    }
  };
  

  const handleTouchMove = (evt: any) => {
    const touches = evt.nativeEvent.touches;

    Array.from(touches).forEach((touch: any) => {
      if (touchIds.current.has(touch.identifier)) {
        touchIds.current.set(touch.identifier, {
          x: touch.locationX,
          y: touch.locationY,
        });

        setCircles((prevCircles) =>
          prevCircles.map((circle: any) =>
            circle.id === touch.identifier
              ? { ...circle, x: touch.locationX, y: touch.locationY }
              : circle
          )
        );
      }
    });
  };

  const handleTouchEnd = (evt: any) => {
    const touches = evt.nativeEvent.changedTouches;

    Array.from(touches).forEach((touch: any) => {
      if (touchIds.current.has(touch.identifier)) {
        touchIds.current.delete(touch.identifier);

        setCircles((prevCircles) =>
          prevCircles.filter((circle) => circle.id !== touch.identifier)
        );
      }
    });

    if (touchIds.current.size < 2) {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      stopAnimations();
    }
  };

  const startAnimations = () => {
    if (!animationActive.current) {
      animationActive.current = true;
      scale.value = withRepeat(withTiming(1.5, { duration: 500 }), -1, true);
      opacity.value = withRepeat(withTiming(0.5, { duration: 500 }), -1, true);
    }
  };

  const stopAnimations = () => {
    animationActive.current = false;
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = 1;
    opacity.value = 1;
  };

  const selectWinner = () => {
    if (circles.length > 0) {
      const randomIndex = Math.floor(Math.random() * circles.length);
      const winningCircle = circles[randomIndex];
      setWinner(winningCircle.id);
      setCircles([winningCircle]);
  
      Vibration.vibrate(5);
      winnerScale.value = withTiming(1.5, { duration: 150 });

      setTimeout(() => {
        setCircles([]);
        getChallenge();
      }, 1000);
    }
  };

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const winnerCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winnerScale.value }],
  }));
  

  const getChallenge = () => {
    if (remainingChallenges.length === 0) {
      console.log('No quedan más desafíos.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * remainingChallenges.length);
    setCurrentChallenge(remainingChallenges[randomIndex]);
    setRemainingChallenges(
      remainingChallenges.filter((_, index) => index !== randomIndex)
    );
  };

  useEffect(() => {
    getChallenge();
  }, []);

  return (
    <ThemedView
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {currentChallenge && <Card challenge={currentChallenge.challenge} />}
      {circles.map((circle) => (
        <Animated.View
          key={circle.id}
          style={[
            styles.circle,
            { left: circle.x - 50, top: circle.y - 50 },
            winner === circle.id ? winnerCircleStyle : animatedCircleStyle,
            winner === circle.id && styles.winnerCircle,
          ]}
        />
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 150, 255, 0.6)',
  },
  winnerCircle: {
    backgroundColor: 'gold',
  },
});

export default App;
