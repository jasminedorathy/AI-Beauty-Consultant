// import { useEffect, useState } from "react";
// import { analyzeImage } from "../../services/api"; // or future getHistory


// export default function HistoryPage() {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     api.get("/history").then((res) => setItems(res.data));
//   }, []);

//   return (
//     <>
//       {items.map((i) => (
//         <pre key={i.id}>{JSON.stringify(i, null, 2)}</pre>
//       ))}
//     </>
//   );
// }
// src/features/history/HistoryPage.js
const HistoryPage = () => {
  return <h2>History coming soon</h2>;
};

export default HistoryPage;
