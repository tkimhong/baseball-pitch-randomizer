// pages/index.js
import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  // Default pitch categories and types
  const defaultPitchCategories = [
    {
      name: "Fastballs",
      pitches: [
        { name: "4-Seam FB", selected: true },
        { name: "2-Seam FB", selected: false },
        { name: "Running FB", selected: false },
        { name: "Sinker", selected: true },
        { name: "Cutter", selected: true },
      ],
    },
    {
      name: "Breaking Balls",
      pitches: [
        { name: "Curveball", selected: false },
        { name: "Slider", selected: false },
        { name: "Slurve", selected: true },
        { name: "Knuckle-Curve", selected: true },
        { name: "Screwball", selected: true },
        { name: "12-6 Curve", selected: false },
        { name: "Sweeping Curve", selected: false },
      ],
    },
    {
      name: "Off-Speed",
      pitches: [
        { name: "Splitter", selected: true },
        { name: "Changeup", selected: true },
        { name: "Circle-Change", selected: false },
        { name: "Palmball", selected: false },
        { name: "Forkball", selected: false },
        { name: "Vulcan-Change", selected: false },
      ],
    },
  ];

  // Preset combinations
  const presetCombinations = [
    {
      name: "Power Pitcher",
      pitches: ["4-Seam FB", "Cutter", "Slider", "Splitter"],
    },
    {
      name: "Finesse Pitcher",
      pitches: ["Sinker", "Changeup", "Curveball", "Slurve"],
    },
    {
      name: "Breaking Ball Specialist",
      pitches: [
        "Curveball",
        "Slider",
        "Knuckle-Curve",
        "12-6 Curve",
        "Sweeping Curve",
      ],
    },
  ];

  const [categories, setCategories] = useState(defaultPitchCategories);
  const [currentPitch, setCurrentPitch] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pitchHistory, setPitchHistory] = useState([]);
  const [count, setCount] = useState({ balls: 0, strikes: 0 });
  const [savedCombinations, setSavedCombinations] =
    useState(presetCombinations);
  const [combinationName, setCombinationName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Grid setup (fixed 5x5 size)
  const gridSize = 5;
  const grid = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(0));

  // Get flat list of all selected pitches
  const getSelectedPitches = () => {
    const selected = [];
    categories.forEach((category) => {
      category.pitches.forEach((pitch) => {
        if (pitch.selected) {
          selected.push({ ...pitch, category: category.name });
        }
      });
    });
    return selected;
  };

  // Function to get next pitch and location
  const getSign = () => {
    const selectedPitches = getSelectedPitches();

    if (selectedPitches.length === 0) {
      alert("Please select at least one pitch type");
      return;
    }

    // Random pitch
    const randomPitchIndex = Math.floor(Math.random() * selectedPitches.length);
    const randomPitch = selectedPitches[randomPitchIndex];

    // Random location (grid position)
    const randomRow = Math.floor(Math.random() * gridSize);
    const randomCol = Math.floor(Math.random() * gridSize);

    const newPitch = {
      ...randomPitch,
      location: { row: randomRow, col: randomCol },
      timestamp: new Date().toLocaleTimeString(),
      isStrike: isInStrikeZone(randomRow, randomCol),
    };

    // Add a sound effect when getting a new sign
    const audio = new Audio();
    audio.src =
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";
    try {
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.log("Audio couldn't play:", e);
    }

    setCurrentPitch(newPitch);
    setCurrentLocation({ row: randomRow, col: randomCol });

    // Add to history - limit to last 10 pitches
    setPitchHistory((prev) => [newPitch, ...prev].slice(0, 10));
  };

  // Toggle pitch selection
  const togglePitch = (categoryIndex, pitchIndex) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].pitches[pitchIndex].selected =
      !updatedCategories[categoryIndex].pitches[pitchIndex].selected;

    setCategories(updatedCategories);
  };

  // Function to check if a cell is in the strike zone
  const isInStrikeZone = (row, col) => {
    // 3x3 strike zone in the middle
    const zoneStart = Math.floor((gridSize - 3) / 2);
    const zoneEnd = zoneStart + 2;
    return (
      row >= zoneStart && row <= zoneEnd && col >= zoneStart && col <= zoneEnd
    );
  };

  // Handle count adjustments
  const incrementBalls = () => {
    if (count.balls < 3) {
      setCount({ ...count, balls: count.balls + 1 });
    } else {
      // Reset count on walk
      setCount({ balls: 0, strikes: 0 });
    }
  };

  const incrementStrikes = () => {
    if (count.strikes < 2) {
      setCount({ ...count, strikes: count.strikes + 1 });
    } else {
      // Reset count on strikeout
      setCount({ balls: 0, strikes: 0 });
    }
  };

  const resetCount = () => {
    setCount({ balls: 0, strikes: 0 });
  };

  // Save current pitch combination
  const savePitchCombination = () => {
    if (!combinationName.trim()) {
      alert("Please enter a name for this combination");
      return;
    }

    const selectedPitchNames = getSelectedPitches().map((pitch) => pitch.name);

    if (selectedPitchNames.length === 0) {
      alert("Please select at least one pitch to save");
      return;
    }

    const newCombination = {
      name: combinationName,
      pitches: selectedPitchNames,
    };

    setSavedCombinations([...savedCombinations, newCombination]);
    setCombinationName("");
    setShowSaveModal(false);
  };

  // Load a saved combination
  const loadCombination = (combination) => {
    const updatedCategories = [...categories];

    // First, unselect all pitches
    updatedCategories.forEach((category) => {
      category.pitches.forEach((pitch) => {
        pitch.selected = false;
      });
    });

    // Then select only the pitches in the combination
    updatedCategories.forEach((category) => {
      category.pitches.forEach((pitch) => {
        if (combination.pitches.includes(pitch.name)) {
          pitch.selected = true;
        }
      });
    });

    setCategories(updatedCategories);
  };

  // Delete a saved combination
  const deleteCombination = (index) => {
    const updatedCombinations = [...savedCombinations];
    updatedCombinations.splice(index, 1);
    setSavedCombinations(updatedCombinations);
  };

  // Get color for pitch type button
  const getPitchButtonColor = (selected) => {
    return selected
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-gray-200 hover:bg-gray-300 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-[#0E131B] py-6 font-['Inter',sans-serif]">
      <Head>
        <title>Baseball Pitch Randomizer</title>
        <meta
          name="description"
          content="Baseball pitch randomizer for practice"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-[#171E2C] rounded-xl shadow-lg overflow-hidden p-6 text-gray-200">
          <h1 className="text-3xl font-bold text-center mb-6 text-[#EA580C] font-['Manrope',sans-serif]">
            Baseball Pitch Randomizer
          </h1>

          {/* Control Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 border-b border-gray-700 pb-4">
            {/* Count Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-semibold mb-1">Count</div>
                <div className="text-2xl font-bold">
                  <span className="text-green-400">{count.balls}</span>-
                  <span className="text-red-400">{count.strikes}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={incrementBalls}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Ball
                </button>
                <button
                  onClick={incrementStrikes}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Strike
                </button>
                <button
                  onClick={resetCount}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Saved Combinations */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Combination
              </button>
              <div className="relative inline-block">
                <select
                  className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal
                           text-white bg-gray-700 bg-clip-padding bg-no-repeat border border-solid border-gray-600
                           rounded transition ease-in-out m-0 focus:text-white focus:bg-gray-600 focus:border-blue-500 focus:outline-none"
                  onChange={(e) =>
                    e.target.value &&
                    loadCombination(savedCombinations[parseInt(e.target.value)])
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Load Preset
                  </option>
                  {savedCombinations.map((combo, idx) => (
                    <option key={idx} value={idx}>
                      {combo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selected Pitch Count */}
          <div className="text-center mb-4">
            <span className="font-medium text-gray-300">
              {getSelectedPitches().length} pitches selected
            </span>
          </div>

          {/* Save Combination Modal */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-[#171E2C] p-6 rounded-lg shadow-xl max-w-md w-full border border-[#1F2A3D]">
                <h3 className="text-lg font-bold mb-4 text-white">
                  Save Pitch Combination
                </h3>
                <input
                  type="text"
                  placeholder="Enter combination name"
                  className="w-full p-2 border rounded mb-4 bg-[#1F2A3D] border-[#2B303B] text-white"
                  value={combinationName}
                  onChange={(e) => setCombinationName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-[#2B303B] rounded hover:bg-[#1F2A3D] text-white"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-[#EA580C] text-white rounded hover:bg-[#C05621]"
                    onClick={savePitchCombination}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pitch Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="border border-[#1F2A3D] rounded-lg p-4 shadow-sm bg-[#171E2C]"
                >
                  <h3 className="text-lg font-semibold mb-3 text-[#EA580C] font-['Manrope',sans-serif]">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.pitches.map((pitch, pitchIndex) => (
                      <button
                        key={pitchIndex}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          pitch.selected
                            ? "bg-[#EA580C] hover:bg-[#C05621] text-white"
                            : "bg-[#1F2A3D] hover:bg-[#2B303B] text-gray-200"
                        }`}
                        onClick={() => togglePitch(categoryIndex, pitchIndex)}
                      >
                        {pitch.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Saved Combinations Management */}
            {savedCombinations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-[#EA580C] font-['Manrope',sans-serif]">
                  Saved Combinations
                </h3>
                <div className="overflow-auto max-h-48 border border-[#1F2A3D] rounded">
                  <table className="min-w-full divide-y divide-[#1F2A3D]">
                    <thead className="bg-[#0E131B]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Pitches
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#171E2C] divide-y divide-[#1F2A3D]">
                      {savedCombinations.map((combo, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-200">
                            {combo.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-400">
                            {combo.pitches.join(", ")}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            <button
                              onClick={() => loadCombination(combo)}
                              className="text-[#EA580C] hover:text-[#FF6A00] mr-3"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteCombination(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Grid Display */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-5 gap-1">
                {grid.map((row, rowIndex) =>
                  row.map((_, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-12 h-12 flex items-center justify-center text-xs font-bold border-2
                        ${
                          isInStrikeZone(rowIndex, colIndex)
                            ? "bg-[#1F2A3D] border-[#00CBFE] shadow-inner shadow-[#00CBFE33]"
                            : "bg-[#0E131B] border-[#1F2A3D]"
                        }
                        ${
                          currentLocation &&
                          currentLocation.row === rowIndex &&
                          currentLocation.col === colIndex
                            ? "bg-[#EA580C] border-[#FF6A00]"
                            : ""
                        }
                      `}
                    >
                      {currentLocation &&
                        currentLocation.row === rowIndex &&
                        currentLocation.col === colIndex && (
                          <span className="text-center break-words">
                            {currentPitch?.name}
                          </span>
                        )}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 text-center text-sm text-gray-400">
                <span className="inline-block w-4 h-4 bg-[#1F2A3D] border border-[#00CBFE] mr-1"></span>{" "}
                Strike Zone
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              {/* Get Sign Button */}
              <button
                className="px-6 py-4 bg-[#EA580C] text-white font-bold rounded-lg shadow-lg hover:bg-[#C05621]
                          transition-colors text-lg w-full max-w-xs font-['Manrope',sans-serif]"
                onClick={getSign}
              >
                Get Sign from Catcher
              </button>

              {/* Current Pitch Display */}
              {currentPitch && (
                <div className="p-4 bg-[#1F2A3D] rounded-lg shadow-md border border-[#2B303B] w-full max-w-xs">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="font-semibold text-[#FF6A00]">
                      {currentPitch.category}
                    </p>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-400">Pitch</p>
                    <p className="font-bold text-xl text-white">
                      {currentPitch.name}
                    </p>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-400">Result</p>
                    <p
                      className={`font-semibold ${
                        currentPitch.isStrike
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {currentPitch.isStrike ? "Strike" : "Ball"}
                    </p>
                  </div>
                </div>
              )}

              {/* Pitch History */}
              {pitchHistory.length > 0 && (
                <div className="w-full">
                  <h3 className="font-semibold text-lg mb-2 text-gray-300 font-['Manrope',sans-serif]">
                    Pitch History
                  </h3>
                  <div className="overflow-auto max-h-64 border border-[#1F2A3D] rounded">
                    <table className="min-w-full divide-y divide-[#1F2A3D]">
                      <thead className="bg-[#0E131B]">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Pitch
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#171E2C] divide-y divide-[#1F2A3D]">
                        {pitchHistory.map((pitch, index) => (
                          <tr
                            key={index}
                            className={index === 0 ? "bg-[#1D222B]" : ""}
                          >
                            <td className="px-3 py-2 text-sm text-gray-400">
                              {pitch.timestamp}
                            </td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-200">
                              {pitch.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-400">
                              {pitch.category}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  pitch.isStrike
                                    ? "bg-green-900 text-green-300"
                                    : "bg-red-900 text-red-300"
                                }`}
                              >
                                {pitch.isStrike ? "Strike" : "Ball"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
