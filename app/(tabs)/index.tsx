import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Image, useWindowDimensions, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 100;
const STORAGE_KEY = '@snake_high_scores';

type Direction = { x: number; y: number };
type Position = { x: number; y: number };
type GameMode = 'classic' | 'ghost' | 'portal';
type HighScores = {
  [key in GameMode]: number;
};

export default function SnakeGame() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLargeScreen = windowWidth >= 768;
  const [gameSize, setGameSize] = useState({ width: 0, height: 0 });
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScores>({
    classic: 0,
    ghost: 0,
    portal: 0,
  });
  const [gameMode, setGameMode] = useState<GameMode>('classic');

  useEffect(() => {
    loadHighScores();
  }, []);

  useEffect(() => {
    const calculateGameSize = () => {
      const maxSize = isLargeScreen 
        ? Math.min(windowHeight * 0.7, (windowWidth - 80) * 0.7) // Reduced from 0.9 to 0.7
        : Math.min(windowWidth * 0.7, windowHeight * 0.6); // Reduced from 0.9/0.8 to 0.7/0.6
      const size = Math.floor(maxSize / GRID_SIZE) * GRID_SIZE;
      setGameSize({ width: size, height: size });
    };

    calculateGameSize();
  }, [windowWidth, windowHeight, isLargeScreen]);

  const loadHighScores = async () => {
    try {
      const savedScores = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error('Error loading high scores:', error);
    }
  };

  const saveHighScore = async (mode: GameMode, newScore: number) => {
    try {
      const newHighScores = {
        ...highScores,
        [mode]: Math.max(highScores[mode], newScore),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHighScores));
      setHighScores(newHighScores);
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const cellSize = gameSize.width / GRID_SIZE;
  const controlSize = Math.min(windowWidth * 0.15, 60);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowUp':
            if (direction.y !== 1) setDirection({ x: 0, y: -1 });
            break;
          case 'ArrowDown':
            if (direction.y !== -1) setDirection({ x: 0, y: 1 });
            break;
          case 'ArrowLeft':
            if (direction.x !== 1) setDirection({ x: -1, y: 0 });
            break;
          case 'ArrowRight':
            if (direction.x !== -1) setDirection({ x: 1, y: 0 });
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [direction]);

  useEffect(() => {
    if (isGameOver) {
      saveHighScore(gameMode, score);
      return;
    }

    const gameLoop = setInterval(() => {
      moveSnake();
    }, GAME_SPEED);

    return () => clearInterval(gameLoop);
  }, [snake, direction, food, isGameOver, gameMode]);

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (gameMode === 'portal') {
      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      if (head.y >= GRID_SIZE) head.y = 0;
    } else if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      setIsGameOver(true);
      return;
    }

    if (gameMode !== 'ghost' && snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setIsGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(score + 1);
      generateFood(newSnake);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const generateFood = (currentSnake: Position[]) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    setFood(newFood);
  };

  const handleTouch = (direction: Direction) => {
    if (
      (direction.x !== 0 && snake[0].x + direction.x !== snake[1]?.x) ||
      (direction.y !== 0 && snake[0].y + direction.y !== snake[1]?.y)
    ) {
      setDirection(direction);
    }
  };

  const resetGame = (mode: GameMode = 'classic') => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({ x: 15, y: 15 });
    setIsGameOver(false);
    setScore(0);
    setGameMode(mode);
  };

  const renderGameModeButton = (mode: GameMode, label: string) => (
    <Pressable
      style={[
        styles.modeButton,
        gameMode === mode && styles.activeModeButton,
      ]}
      onPress={() => resetGame(mode)}>
      <Text style={[
        styles.modeButtonText,
        gameMode === mode && styles.activeModeButtonText
      ]}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[
      styles.safeArea,
      isLargeScreen && { marginLeft: 80 }
    ]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>Score: {score}</Text>
            <Text style={styles.highScore}>Best: {highScores[gameMode]}</Text>
          </View>
          <View style={styles.modeContainer}>
            {renderGameModeButton('classic', 'Classic')}
            {renderGameModeButton('ghost', 'Ghost')}
            {renderGameModeButton('portal', 'Portal')}
          </View>
        </View>

        <View
          style={[
            styles.gameBoard,
            {
              width: gameSize.width,
              height: gameSize.height,
            },
          ]}>
          {snake.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: cellSize - 2,
                  height: cellSize - 2,
                  left: segment.x * cellSize + 1,
                  top: segment.y * cellSize + 1,
                  backgroundColor: index === 0 ? '#4ade80' : '#22c55e',
                  opacity: gameMode === 'ghost' ? 0.7 : 1,
                },
              ]}
            />
          ))}
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=50&h=50&fit=crop' }}
            style={[
              styles.food,
              {
                width: cellSize,
                height: cellSize,
                left: food.x * cellSize,
                top: food.y * cellSize,
              },
            ]}
          />
        </View>

        {Platform.OS !== 'web' && (
          <View style={[styles.controls, { marginTop: windowHeight * 0.02 }]}>
            <View style={styles.controlRow}>
              <Pressable
                style={[styles.controlButton, { width: controlSize, height: controlSize }]}
                onPress={() => handleTouch({ x: 0, y: -1 })}>
                <Text style={styles.controlText}>↑</Text>
              </Pressable>
            </View>
            <View style={styles.controlRow}>
              <Pressable
                style={[styles.controlButton, { width: controlSize, height: controlSize }]}
                onPress={() => handleTouch({ x: -1, y: 0 })}>
                <Text style={styles.controlText}>←</Text>
              </Pressable>
              <Pressable
                style={[styles.controlButton, { width: controlSize, height: controlSize }]}
                onPress={() => handleTouch({ x: 1, y: 0 })}>
                <Text style={styles.controlText}>→</Text>
              </Pressable>
            </View>
            <View style={styles.controlRow}>
              <Pressable
                style={[styles.controlButton, { width: controlSize, height: controlSize }]}
                onPress={() => handleTouch({ x: 0, y: 1 })}>
                <Text style={styles.controlText}>↓</Text>
              </Pressable>
            </View>
          </View>
        )}

        {isGameOver && (
          <View style={styles.gameOver}>
            <Text style={styles.gameOverText}>Game Over!</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            {score === highScores[gameMode] && score > 0 && (
              <Text style={styles.newHighScore}>New High Score! 🎉</Text>
            )}
            <Pressable style={styles.resetButton} onPress={() => resetGame(gameMode)}>
              <Text style={styles.resetButtonText}>Play Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  highScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
  },
  activeModeButton: {
    backgroundColor: '#047857',
    borderColor: '#059669',
  },
  modeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeModeButtonText: {
    color: '#ffffff',
  },
  gameBoard: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#1f2937',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    borderRadius: 4,
  },
  food: {
    position: 'absolute',
    borderRadius: 100,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 5,
  },
  controlButton: {
    backgroundColor: '#047857',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameOver: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  gameOverText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScore: {
    color: 'white',
    fontSize: 24,
    marginBottom: 10,
  },
  newHighScore: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});