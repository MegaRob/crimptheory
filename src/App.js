import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';

// Global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = {
  apiKey: "AIzaSyAFkyYeDj5EdneXyzht_AUhpdfyZ9a4yJo",
  authDomain: "crimptheory-5377a.firebaseapp.com",
  projectId: "crimptheory-5377a",
  storageBucket: "crimptheory-5377a.firebasestorage.app",
  messagingSenderId: "32802586214",
  appId: "1:32802586214:web:be86d83cabea931088f7a7",
  measurementId: "G-079S711L26"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// A custom message box component instead of alert/confirm
const MessageBox = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <p className="text-lg font-semibold mb-4 text-black">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Login Page Component
const LoginPage = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messageBox, setMessageBox] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessageBox('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Failed to log in. Please check your credentials.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This user account has been disabled.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      setMessageBox(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center leading-tight">Login to Climbing Protocols</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-md flex flex-col items-center space-y-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>
        <p className="text-gray-400">
          Don't have an account?{' '}
          <button onClick={onNavigateToRegister} className="text-blue-400 hover:underline">
            Register here
          </button>
        </p>
      </div>
      <MessageBox message={messageBox} onClose={() => setMessageBox(null)} />
    </div>
  );
};

// Registration Page Component
const RegisterPage = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messageBox, setMessageBox] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      setMessageBox('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setMessageBox('Password should be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessageBox('Registration successful! You can now log in.');
      onRegisterSuccess(); // Navigate to login page after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = 'Failed to register. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please log in or use a different email.';
        console.log("Setting message box for email-already-in-use:", errorMessage); // Added console.log
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please enable it in your Firebase project console under Authentication -> Sign-in method.';
      }
      setMessageBox(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center leading-tight">Register for Climbing Protocols</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-md flex flex-col items-center space-y-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="text-gray-400">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="text-blue-400 hover:underline">
            Login here
          </button>
        </p>
      </div>
      <MessageBox message={messageBox} onClose={() => setMessageBox(null)} />
    </div>
  );
};


// Home component updated to only show Repeaters Protocol
const Home = ({ onSelectProtocol, onViewHistory, userEmail, onLogout }) => { // Changed userId to userEmail
  const [weight, setWeight] = useState('');
  const [messageBox, setMessageBox] = useState(null); // For custom message box

  const handleStart = (protocol) => {
    if (!weight || parseFloat(weight) <= 0) {
      setMessageBox('Please enter a valid weight you are using before starting.');
      return;
    }
    onSelectProtocol(protocol, parseFloat(weight));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center leading-tight">Climbing Training Protocols</h1>
      {userEmail && ( // Display userEmail instead of userId
          <p className="text-sm text-gray-400 mb-6">Welcome: <span className="font-mono bg-gray-700 px-2 py-1 rounded text-gray-200 break-all">{userEmail}</span></p>
      )}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-md flex flex-col items-center space-y-6">
        <div className="w-full">
          <label htmlFor="weight" className="block text-lg font-semibold mb-2 text-gray-300">Enter Target Weight (lbs or kg): </label>
          <input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 10, 25"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 w-full"> {/* Adjusted grid to single column */}
          <button
            onClick={() => handleStart('repeaters')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-5 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-75"
          >
            Repeaters Protocol
          </button>
          <button
            onClick={onViewHistory}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-5 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-75 col-span-full"
          >
            View Workout History
          </button>
          <button
            onClick={onLogout}
            className="w-full px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>
      <MessageBox message={messageBox} onClose={() => setMessageBox(null)} />
    </div>
  );
};

// WorkoutHistory component (kept as is)
const WorkoutHistory = ({ onBackToHome, userId, db, authReady }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!authReady || !userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const workoutCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/workoutSummaries`);
        const q = query(workoutCollectionRef);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
        setHistory(data);
      } catch (err) {
        console.error("Error fetching workout history:", err);
        setError("Failed to load workout history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId, db, authReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center">
      <button
        onClick={onBackToHome}
        className="self-start mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow-md transition duration-200 ease-in-out"
      >
        ← Back to Home
      </button>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Workout History</h1>

      {loading && <p className="text-gray-400 text-lg">Loading history...</p>}
      {error && <p className="text-red-400 text-lg">{error}</p>}
      {!loading && history.length === 0 && !error ? (
        <p className="text-gray-400 text-lg">No workout history found.</p>
      ) : (
        <ul className="w-full max-w-2xl space-y-6">
          {history.map((entry) => (
            <li key={entry.id} className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <strong className="text-2xl font-bold text-teal-400">{entry.protocol}</strong>
                <span className="text-gray-400 text-sm">
                  {entry.timestamp ? new Date(entry.timestamp.toDate ? entry.timestamp.toDate() : entry.timestamp).toLocaleString() : 'N/A'}
                </span>
              </div>
              <p className="text-gray-300 mb-2">Weight used: <span className="font-bold">{entry.weight}</span> lbs/kg</p>
              {entry.gripTypesUsed && entry.gripTypesUsed.length > 0 && (
                   <p className="text-xl text-gray-300">Grip Types Used: <span className="font-bold text-teal-400">{entry.gripTypesUsed.join(' & ')}</span></p>
               )}
               {entry.totalLiftingTime !== undefined && (
                 <p className="text-xl text-gray-300">Total time holding: <span className="font-bold text-teal-400">{Math.floor(entry.totalLiftingTime / 60).toString().padStart(2, '0')}:{ (entry.totalLiftingTime % 60).toString().padStart(2, '0')}</span></p>
               )}
               {entry.totalRestingTime !== undefined && (
                 <p className="text-xl text-gray-300">Total time resting: <span className="font-bold text-teal-400">{Math.floor(entry.totalRestingTime / 60).toString().padStart(2, '0')}:{ (entry.totalRestingTime % 60).toString().padStart(2, '0')}</span></p>
               )}
               {entry.totalWorkoutTime !== undefined && (
                 <p className="text-xl text-gray-300">Total time of workout: <span className="font-bold text-teal-400">{Math.floor(entry.totalWorkoutTime / 60).toString().padStart(2, '0')}:{ (entry.totalWorkoutTime % 60).toString().padStart(2, '0')}</span></p>
               )}
               {entry.overallRPE !== undefined && (
                 <p className="text-xl text-gray-300 mt-4">Overall RPE: <span className="font-bold text-teal-400">{entry.overallRPE}</span></p>
               )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ComplexRepeaterProtocol component
const ComplexRepeaterProtocol = ({ onBackToHome, weight, userId, db }) => {
  // Function to create a workout plan for a single grip type and both hands
  const createGripWorkoutPlan = (gripType) => {
    const sets = [];
    const holdDuration = 7;
    const shortRestDuration = 3;
    const longRestBetweenSets = 150; // 2-3 minutes (2.5 minutes)
    const totalLiftsPerSet = 6;
    const numberOfSetsPerHand = 3; 

    const currentIntensity = 1.0; // All sets are working sets at target weight

    const addHandSets = (hand) => {
      for (let setIdx = 0; setIdx < numberOfSetsPerHand; setIdx++) {
        for (let liftIdx = 1; liftIdx <= totalLiftsPerSet; liftIdx++) {
          sets.push({
            id: `${gripType}-${hand}-Set${setIdx + 1}-Lift${liftIdx}`,
            type: 'work',
            duration: holdDuration,
            grip: gripType,
            hand: hand,
            subType: 'Lift',
            setGroup: 'Working Set', // All sets are working sets now
            setNumber: setIdx + 1,
            liftNumber: liftIdx,
            intensity: currentIntensity,
            message: `Lift` // Changed message to just "Lift"
          });
          if (liftIdx < totalLiftsPerSet) {
            sets.push({
              id: `${gripType}-${hand}-Set${setIdx + 1}-Rest${liftIdx}`,
              type: 'rest',
              duration: shortRestDuration,
              grip: gripType,
              hand: hand,
              subType: 'Short Rest',
              setGroup: 'Working Set',
              setNumber: setIdx + 1,
              message: `Rest` // Changed message to just "Rest"
            });
          }
        }

        // Add long rest between sets, if not the very last set for this hand
        if (setIdx < numberOfSetsPerHand - 1) {
          sets.push({
            id: `${gripType}-${hand}-Set${setIdx + 1}-LongRest`,
            type: 'rest',
            duration: longRestBetweenSets,
            grip: gripType,
            hand: hand,
            subType: 'Long Rest Between Sets',
            setGroup: 'Working Set',
            setNumber: setIdx + 1,
            message: `Rest` // Changed message to just "Rest"
          });
        }
      }
    };

    addHandSets('Right Hand');
    sets.push({
      id: `${gripType}-Transition-Hand`,
      type: 'rest',
      duration: 180, // 3 minutes rest between hands
      grip: gripType,
      hand: 'Both Hands',
      subType: 'Rest Between Hands',
      message: "Rest" // Changed message to just "Rest"
    });
    addHandSets('Left Hand');

    return sets;
  };

  const [selectedGripType1, setSelectedGripType1] = useState(null);
  const [selectedGripType2, setSelectedGripType2] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentRPE, setCurrentRPE] = useState(0); // RPE value entered by user
  const [isWaitingForRPE, setIsWaitingForRPE] = useState(false); // New state for RPE input pause
  const [workoutSummaryData, setWorkoutSummaryData] = useState([]); // Stores completed work steps
  const [messageBox, setMessageBox] = useState(null);
  const [message, setMessage] = useState("Select your first grip type for Repeater Protocol.");

  const timerRef = useRef(null);
  const workoutStartTime = useRef(0); // To track total workout time

  const currentStep = workoutPlan[currentStepIndex];
  const isWorkPhase = currentStep && currentStep.type === 'work';

  const getActualWeight = (targetWeight, intensity) => {
    return (targetWeight * intensity).toFixed(1);
  };

  const handleGripType1Select = (gripType) => {
    setSelectedGripType1(gripType);
    const otherGripType = gripType === '20mm Half-Crimp' ? '30mm Open Hand' : '20mm Half-Crimp';
    setSelectedGripType2(otherGripType);

    const plan1 = createGripWorkoutPlan(gripType);
    const transitionRest = [{
      id: `Overall-Transition-GripTypes`,
      type: 'rest',
      duration: 300, // 5 minutes rest
      grip: 'Transition',
      hand: 'Both Hands',
      subType: 'Rest between Grip Types',
      message: "Rest" // Changed message to just "Rest"
    }];
    const plan2 = createGripWorkoutPlan(otherGripType);

    setWorkoutPlan([...plan1, ...transitionRest, ...plan2]);
    setCurrentStepIndex(0);
    setMessage(`Ready for ${gripType} then ${otherGripType} Repeater Protocol.`);
    if (plan1.length > 0) {
        setCurrentTime(plan1[0].duration);
    }
  };

  const saveRepeaterSummaryToFirestore = useCallback(async (finalRPE, fullSummary, totalLiftTime, totalRestTime, totalWorkoutDuration) => {
    if (!userId) {
      setMessageBox("Error: User not authenticated. Cannot save workout.");
      return;
    }
    try {
      const protocolTitle = `Repeater Protocol (${selectedGripType1 || 'N/A'} then ${selectedGripType2 || 'N/A'})`;
      const workoutCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/workoutSummaries`);
      await addDoc(workoutCollectionRef, {
        protocol: protocolTitle,
        weight: weight,
        timestamp: serverTimestamp(),
        summary: fullSummary,
        overallRPE: finalRPE,
        totalLiftingTime: totalLiftTime,
        totalRestingTime: totalRestTime,
        totalWorkoutTime: totalWorkoutDuration,
        gripTypesUsed: [selectedGripType1 || 'N/A', selectedGripType2 || 'N/A']
      });
      console.log("Repeater workout summary saved to Firestore.");
      setMessageBox("Workout saved successfully!");
    } catch (error) {
      console.error("Error saving Repeater summary to Firestore:", error);
      setMessageBox(`Error saving workout: ${error.message}`);
    }
  }, [userId, db, appId, selectedGripType1, selectedGripType2, weight]);

  const startWorkout = useCallback(() => {
    if (weight <= 0) {
      setMessageBox("Please go back and enter a valid target weight before starting this protocol.");
      return;
    }
    if (!selectedGripType1 || workoutPlan.length === 0) {
        setMessageBox("Please select a grip type before starting the workout.");
        return;
    }
    if (!currentStep) {
      setMessageBox("Workout plan not loaded correctly. Please try again.");
      return;
    }

    setWorkoutRunning(true);
    setCurrentTime(currentStep.duration);
    setMessage(currentStep.message);
    workoutStartTime.current = Date.now();
  }, [currentStep, weight, selectedGripType1, workoutPlan]);

  const resetWorkout = () => {
    clearInterval(timerRef.current);
    setWorkoutRunning(false);
    setCurrentStepIndex(0);
    setCurrentTime(0);
    setCurrentRPE(0);
    setIsWaitingForRPE(false);
    setWorkoutSummaryData([]);
    setMessageBox(null);
    setSelectedGripType1(null);
    setSelectedGripType2(null);
    setWorkoutPlan([]);
    setMessage("Select your first grip type for Repeater Protocol.");
    workoutStartTime.current = 0;
  };

  const handleFinalRPEConfirm = useCallback(() => {
    if (currentRPE < 1 || currentRPE > 10) {
      setMessageBox('Please enter a valid RPE (1-10) before finishing the workout.');
      return;
    }
    setIsWaitingForRPE(false);

    let totalLiftTime = 0;
    let totalRestTime = 0;
    workoutSummaryData.forEach(entry => {
        if (entry.type === 'work') {
            totalLiftTime += (entry.duration || 0);
        } else if (entry.type === 'rest') {
            totalRestTime += (entry.duration || 0);
        }
    });

    const totalWorkoutDurationPlanned = workoutPlan.reduce((sum, step) => sum + (step.duration || 0), 0);

    saveRepeaterSummaryToFirestore(currentRPE, workoutSummaryData, totalLiftTime, totalRestTime, totalWorkoutDurationPlanned);
    setCurrentRPE(0);
    setMessage("Workout complete!");
  }, [currentRPE, workoutSummaryData, saveRepeaterSummaryToFirestore, workoutPlan]);


  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (workoutRunning && currentTime > 0) {
      timerRef.current = setInterval(() => setCurrentTime(t => t - 1), 1000);
    } else if (workoutRunning && currentTime === 0) {
      clearInterval(timerRef.current);

      if (currentStep) {
          const newSummaryEntry = {
              grip: currentStep.grip || null,
              hand: currentStep.hand || null,
              type: currentStep.type || null,
              subType: currentStep.subType || null,
              setGroup: currentStep.setGroup || null,
              setNumber: currentStep.setNumber || null,
              liftNumber: currentStep.liftNumber || null,
              duration: currentStep.duration || null,
              actualWeight: currentStep.type === 'work' ? (parseFloat(getActualWeight(weight, currentStep.intensity)) || null) : null,
              reps: currentStep.type === 'work' ? (currentStep.reps || 1) : null,
          };
          setWorkoutSummaryData(prev => [...prev, newSummaryEntry]);
      }


      const nextIndex = currentStepIndex + 1;
      if (nextIndex < workoutPlan.length) {
          const nextStep = workoutPlan[nextIndex];
          setCurrentStepIndex(nextIndex);
          setCurrentTime(nextStep.duration);
          setMessage(nextStep.message);
      } else {
          setWorkoutRunning(false);
          setIsWaitingForRPE(true);
          setMessage("Workout complete! Please enter your overall RPE.");
      }
    }
    return () => clearInterval(timerRef.current);
  }, [workoutRunning, currentTime, currentStepIndex, workoutPlan, workoutSummaryData, saveRepeaterSummaryToFirestore, weight, currentStep]);

  useEffect(() => {
    if (currentStep && !isWaitingForRPE && workoutRunning) {
      setCurrentTime(currentStep.duration);
      setMessage(currentStep.message);
    } else if (!selectedGripType1) {
      setMessage("Select your first grip type for Repeater Protocol.");
    }
  }, [currentStepIndex, selectedGripType1, workoutPlan, currentStep, isWaitingForRPE, workoutRunning]);


  const totalWorkoutSteps = workoutPlan.length;
  const durationForProgress = currentStep ? currentStep.duration : 0;
  const progressPercentage = durationForProgress > 0 && workoutRunning ? ((durationForProgress - currentTime) / durationForProgress) * 100 : 0;
  const timerDisplay = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`;

  if (!selectedGripType1) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center justify-center space-y-6">
              <h2 className="text-3xl font-bold text-teal-300 mb-4">Select Repeater Grip Types</h2>
              <p className="text-lg text-gray-300 text-center mb-4">Choose the first grip type for your workout. The other will be used second.</p>
              <button
                onClick={() => handleGripType1Select('20mm Half-Crimp')}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-75 w-64"
              >
                20mm Half-Crimp First
              </button>
              <button
                onClick={() => handleGripType1Select('30mm Open Hand')}
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-75 w-64"
              >
                30mm Open Hand First
              </button>
              <button
                onClick={onBackToHome}
                className="mt-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow-md transition duration-200 ease-in-out"
              >
                ← Back to Home
              </button>
              <MessageBox message={messageBox} onClose={() => setMessageBox(null)} />
          </div>
      );
  }

  if (!currentStep) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-2xl">
              <p className="text-xl">Building workout plan...</p>
          </div>
      );
  }

  const displayWeight = currentStep.intensity ? getActualWeight(weight, currentStep.intensity) : weight;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center">
      <button
        onClick={resetWorkout}
        className="self-start mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow-md transition duration-200 ease-in-out"
      >
        ← Back to Select Grip
      </button>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Repeater Protocol</h1>
      <h2 className="text-2xl font-bold mb-4 text-center text-teal-300">
        ({selectedGripType1} then {selectedGripType2})
      </h2>

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-md flex flex-col items-center space-y-6">
        <p className="text-2xl font-semibold text-gray-300 text-center">{message}</p>

        {currentStep.grip && (
            <p className="text-xl text-gray-300">
                Grip: <span className="font-bold text-teal-400">{currentStep.grip}</span>
            </p>
        )}
        {currentStep.hand && (currentStep.hand !== 'Both Hands') && (
            <p className="text-xl text-gray-300">
                Hand: <span className="font-bold text-teal-400">{currentStep.hand}</span>
            </p>
        )}
        {currentStep.setNumber && (
            <p className="text-xl text-gray-300">
                Set: <span className="font-bold text-teal-400">{currentStep.setNumber}</span> / 3
            </p>
        )}
          {currentStep.liftNumber && isWorkPhase && (
            <p className="text-xl text-gray-300">
                Lift: <span className="font-bold text-teal-400">{currentStep.liftNumber}</span> / 6
            </p>
        )}
        {(currentStep.intensity && currentStep.intensity > 0 && currentStep.type === 'work') && (
          <p className="text-xl text-gray-300">
            Approx. Weight: <span className="font-bold text-teal-400">{displayWeight}</span> lbs/kg
          </p>
        )}


        <div className="relative w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600 shadow-inner overflow-hidden">
            <div
            className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-1000 ease-linear"
            style={{ height: `${progressPercentage}%` }}
          ></div>
          <span className="relative z-10 text-6xl font-bold text-white">
            {timerDisplay}
          </span>
        </div>

        <p className="text-xl text-gray-300">Overall Progress: <span className="font-bold text-teal-400">{currentStepIndex + 1}</span> / {totalWorkoutSteps}</p>

        {isWaitingForRPE && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="rpe" className="text-lg text-gray-300">Overall Workout RPE (1-10): </label>
              <input
                id="rpe"
                type="number"
                value={currentRPE}
                onChange={(e) => setCurrentRPE(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1" max="10"
              />
            </div>
            <button
                onClick={handleFinalRPEConfirm}
                className="px-8 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 w-full"
            >
              Confirm RPE & Finish Workout
            </button>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          {!workoutRunning && currentStepIndex < totalWorkoutSteps && !isWaitingForRPE ? (
            <button
              onClick={startWorkout}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {currentStepIndex === 0 ? "Start Workout" : "Resume Workout"}
            </button>
          ) : (
            workoutRunning && currentStepIndex < totalWorkoutSteps && (
                <button
                onClick={() => {
                  clearInterval(timerRef.current);
                  setWorkoutRunning(false);
                  setMessage("Paused.");
                }}
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Pause
              </button>
            )
          )}
          <button
            onClick={resetWorkout}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </div>
      <MessageBox message={messageBox} onClose={() => setMessageBox(null)} />
    </div>
  );
};


const App = () => {
  const [currentView, setCurrentView] = useState('login'); // Start at login page
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // New state for user email
  const [authReady, setAuthReady] = useState(false);
  const [weight, setWeight] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  useEffect(() => {
    // Initial authentication check and listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If an authenticated user is found (email/password or custom token login)
        setUserId(user.uid);
        setUserEmail(user.email); // Set user email
        setIsLoggedIn(true);
        // If a custom token was used for initial environment setup and it matches the current user
        // We want to force explicit login for the user, so we will sign them out
        // if they are *only* anonymously logged in from the initial token.
        // The check for user.isAnonymous is key here. If a user logs in with email/password,
        // user.isAnonymous will be false, and they will proceed to 'home'.
        if (user.isAnonymous && initialAuthToken) {
            console.log("Anonymous user detected from Canvas initial token. Redirecting to login.");
            await signOut(auth); // Sign out the anonymous user
            setUserId(null);
            setUserEmail(null); // Clear user email
            setIsLoggedIn(false);
            setCurrentView('login');
        } else {
             setCurrentView('home'); // Navigate to home for non-anonymous, authenticated users
        }
      } else {
        // No user is logged in, or user logged out
        setUserId(null);
        setUserEmail(null); // Clear user email
        setIsLoggedIn(false);
        setCurrentView('login'); // Always redirect to login if not logged in
      }
      setAuthReady(true); // Firebase auth state is ready
    });

    // We do not signInAnonymously or signInWithCustomToken here anymore
    // as the user explicitly wants email/password authentication.
    // The onAuthStateChanged listener handles the initial state.

    return () => unsubscribe(); // Cleanup auth listener
  }, [initialAuthToken]); // Rerun if initialAuthToken changes

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // State will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-2xl">
        Loading authentication...
      </div>
    );
  }

  const handleSelectProtocol = (protocol, selectedWeight) => {
    setWeight(selectedWeight);
    setCurrentView(protocol);
  };

  // Pass userEmail to Home component
  const commonProps = { onBackToHome: () => setCurrentView('home'), userId, db, weight };

  if (!isLoggedIn) {
    switch (currentView) {
      case 'register':
        return <RegisterPage onRegisterSuccess={() => setCurrentView('login')} onNavigateToLogin={() => setCurrentView('login')} />;
      case 'login':
      default:
        return <LoginPage onLoginSuccess={() => setCurrentView('home')} onNavigateToRegister={() => setCurrentView('register')} />;
    }
  }

  // Only render main app content if logged in
  switch (currentView) {
    case 'home':
      return <Home onSelectProtocol={handleSelectProtocol} onViewHistory={() => setCurrentView('history')} userId={userId} userEmail={userEmail} onLogout={handleLogout} />;
    case 'repeaters':
      return <ComplexRepeaterProtocol {...commonProps} />;
    case 'history':
      return <WorkoutHistory {...commonProps} authReady={authReady} />;
    default:
      return <Home onSelectProtocol={handleSelectProtocol} onViewHistory={() => setCurrentView('history')} userId={userId} onLogout={handleLogout} />;
  }
};

export default App;
