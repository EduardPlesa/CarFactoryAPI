import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { OverviewPage } from "./pages/OverviewPage"
import { FramesPage } from "./pages/FramesPage"
import { InventoryPage } from "./pages/InventoryPage"
import { BlueprintsPage } from "./pages/BlueprintsPage"

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/frames" element={<FramesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/blueprints" element={<BlueprintsPage />} />
      </Routes>
    </Layout>
  )
}
