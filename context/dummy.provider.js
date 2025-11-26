// "use client";

// import axios from "axios";
// import { createContext, useContext, useState, useEffect } from "react";

// const MatchesContext = createContext();

// export const MatchesProvider = ({ children }) => {
//   const [matches, setMatches] = useState([]);
//   const [loadingMatches, setLoadingMatches] = useState(false);

//   useEffect(() => {
//     fetchMatches();
//   }, []);

//   const fetchMatches = async () => {
//     setLoadingMatches(true);
//     try {
//       //use axios
//       const response = await axios.get("/api/matches");
//       setMatches(response.data.matches);
//     } catch (error) {
//       console.error("Error fetching matches:", error);
//     } finally {
//       setLoadingMatches(false);
//     }
//   };

//   return (
//     <MatchesContext.Provider value={{ matches, fetchMatches, loadingMatches }}>
//       {children}
//     </MatchesContext.Provider>
//   );
// };

// export const useMatchesContext = () => useContext(MatchesContext);
