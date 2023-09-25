import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import firebase from "firebase/compat/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/compat/firestore";

const HomeScreen = () => {
  const [missing, setMissing] = useState("_________"); //remove
  const { width, height } = Dimensions.get("window");
  const [clicked, setClicked] = useState(-1);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [correct, setCorrect] = useState(-1);
  const [germanSentence, setGermanSentence] = useState("");
  const lists = ["car", "color", "dog", "house", "now"];
  const [sentences, setSentences] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [loading, setLoading] = useState(true);

  const firebaseConfig = {
    apiKey: "AIzaSyDHivkRiffki4ZvaZMDixH1EZwwwbjCxR0",
    authDomain: "project-6611e.firebaseapp.com",
    databaseURL: "https://project-6611e-default-rtdb.firebaseio.com",
    projectId: "project-6611e",
    storageBucket: "project-6611e.appspot.com",
    messagingSenderId: "173445878326",
    appId: "1:173445878326:web:0635717cfab5c694c87e97",
    measurementId: "G-PJMNRLNLFK",
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  // const db = app.firestore()

  useEffect(() => {
    fetchWord();
    fetchSentences();
    fetchMatches();
  }, [fetchWord, fetchSentences, fetchMatches]);

  useEffect(() => {
    setGermanSentences(0, -1);
  }, [sentences, answer, wordList]);

  const fetchWord = useCallback(async () => {
    try {
      const collectionRef = firebase.firestore().collection("words");
      collectionRef.get().then((collectionSnapshot) => {
        collectionSnapshot.forEach((document) => {
          const data = document.data();
          setWordList(setData(data));
        });
      });
    } catch (err) {
      console.log("Error in fetching words", err);
    }
  }, []);

  const fetchSentences = useCallback(async () => {
    try {
      firebase
        .firestore()
        .collection("sentences")
        .get()
        .then((collectionSnapshot) => {
          collectionSnapshot.forEach((document) => {
            const data = document.data();
            setSentences(setData(data));
          });
        });
    } catch (err) {
      console.log("Error in fetching sentences", err);
    }
  });

  const fetchMatches = useCallback(async () => {
    try {
      firebase
        .firestore()
        .collection("matches")
        .get()
        .then((collectionSnapshot) => {
          collectionSnapshot.forEach((document) => {
            const data = document.data();
            setAnswer(setData(data));
          });
        });
    } catch (err) {
      console.log("Error in fetching sentences", err);
    }
  });

  const setData = (data) => {
    const list = [];
    lists.filter((word) => {
      list.push(data[word]);
    });
    return list;
  };

  const setGermanSentences = (puzzleIndex, clicked) => {
    if (sentences.length) {
      const wordsArray1 = sentences[puzzleIndex][0].split(" ");
      const index = wordsArray1.indexOf(lists[puzzleIndex]);
      const wordsArray2 = sentences[puzzleIndex][1].split(" ");
      let newSentence = "";
      wordsArray2.filter((word, id) => {
        if (id === index) {
          if (clicked === -1) newSentence = `${newSentence} _________ `;
          else newSentence = newSentence + wordList[puzzleIndex][clicked];
        } else {
          newSentence = `${newSentence} ${word} `;
        }
      });
      setGermanSentence(newSentence);
    }
  };

  const clickContinue = () => {
    if (correct > 0) {
      if (puzzleIndex > 3) {
        setPuzzleIndex(0);
        setClicked(-1)
        setGermanSentences(0, -1);
      } else {
        setPuzzleIndex(puzzleIndex + 1);
        setClicked(-1)
        setGermanSentences(puzzleIndex + 1, -1);
      }
    }
  };

  const clickWord = (id) => {
    if (clicked === id) {
      setClicked(-1);
      setCorrect(-1);
      setGermanSentences(puzzleIndex, -1);
    } else {
      setClicked(id);
      setGermanSentences(puzzleIndex, id);
      if (
        wordList[puzzleIndex][id].toString().toLowerCase() ===
        answer[puzzleIndex].toString().toLowerCase()
      ) {
        setCorrect(1);
      } else {
        setCorrect(0);
      }
    }
  };

  const wordsComponent = useMemo(() => {
    return wordList.length ? (
      wordList[puzzleIndex].map((word, key) => {
        return (
          <Text
            style={
              clicked === -1
                ? styles.puzzleText
                : clicked === key
                ? styles.clickedPuzzleText
                : styles.restPuzzleText
            }
            onPress={() => clickWord(key)}
            key={key}
          >
            {word}
          </Text>
        );
      })
    ) : (
      <></>
    );
  }, [wordList, clicked, puzzleIndex, answer]);

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={[styles.boxContainer, { height: height * 0.9 }]}>
        <View style={styles.puzzleContainer}>
          <Text style={[styles.whiteText, styles.description]}>
            Fill in the missing word
          </Text>
          <Text style={[styles.whiteText, styles.statement]}>
            {!sentences.length ? "" : sentences[puzzleIndex][0]}
          </Text>
          <View style={styles.tipBox}>
            <View style={clicked > -1 ? styles.hidden : styles.tooltip}>
              <View style={clicked > -1 ? styles.hidden : styles.arrow} />
              <Text style={[styles.tooltipText]}>
                {!sentences.length
                  ? ""
                  : sentences[puzzleIndex][0].split(" ")[0]}
              </Text>
            </View>
            <View style={styles.quizBox}>
              <Text style={[styles.whiteText, styles.quiz]}>
                {germanSentence}
              </Text>
            </View>
          </View>
          <View style={styles.puzzleBox}>{wordsComponent}</View>
        </View>
      </View>
      <View
        style={!correct ? styles.wrongButtonComponent : styles.buttonComponent}
      >
        <View style={!correct ? [styles.answerDesc] : styles.hidden}>
          <View style={styles.flex}>
            <Text style={[styles.whiteText, styles.title]}>Answer: {answer[puzzleIndex]}</Text>
            <Text style={[styles.whiteText, styles.answerText]}>
              {wordList[answer]}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={!correct ? styles.wrongContinueButton : styles.continueButton}
          onPress={clickContinue}
        >
          <Text
            style={
              !correct
                ? styles.wrongButtonText
                : [styles.whiteText, styles.buttonText]
            }
          >
            CONTINUE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#85d8ff",
    position: "relative",
  },
  boxContainer: {
    backgroundColor: "#436b82",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
    paddingVertical: 30,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  whiteText: {
    color: "white",
  },
  puzzleContainer: {
    // color: "white"
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  description: {
    fontSize: 11,
  },
  statement: {
    fontSize: 16,
  },
  quizBox: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: 10,
  },
  quiz: {
    fontSize: 14,
  },
  answer: {
    fontSize: 14,
    backgroundColor: "#ff8686",
    color: "#ffffff",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
  },
  tipBox: {
    position: "relative",
  },
  hidden: {
    display: "none",
  },
  tooltip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: -20,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "white",
    position: "relative",
    marginBottom: 10,
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
    bottom: -10,
    left: 20,
    marginLeft: -5,
  },
  tooltipText: {
    color: "#2c4e68",
  },
  puzzleBox: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  puzzleText: {
    borderRadius: 15,
    backgroundColor: "white",
    color: "#2c4e68",
    textAlign: "center",
    fontWeight: "bold",
    padding: 15,
  },
  restPuzzleText: {
    borderRadius: 15,
    backgroundColor: "#a0b5c2",
    color: "#678296",
    textAlign: "center",
    fontWeight: "bold",
    padding: 15,
  },
  clickedPuzzleText: {
    borderRadius: 15,
    backgroundColor: "#6a91a8",
    color: "#6a91a800",
    textAlign: "center",
    fontWeight: "bold",
    padding: 15,
  },
  continueButton: {
    backgroundColor: "#6a91a8",
    borderRadius: 100,
    color: "white",
    padding: 20,
    textAlign: "center",
    marginBottom: 20,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "900",
  },
  buttonComponent: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    width: "100%",
  },
  wrongButtonComponent: {
    backgroundColor: "#ff8285",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    width: "100%",
  },
  answerDesc: {
    display: "flex",
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  wrongContinueButton: {
    backgroundColor: "white",
    borderRadius: 100,
    color: "#ff908e",
    padding: 20,
    textAlign: "center",
    marginBottom: 20,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  wrongButtonText: {
    color: "#ff908e",
    fontWeight: "900",
  },
});

export default HomeScreen;