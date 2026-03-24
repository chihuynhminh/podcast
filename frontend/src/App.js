import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
function App() {
    return (_jsx(Router, { children: _jsxs("div", { className: "app-container", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "Music Manager" }), _jsx("p", { children: "Manage your local audio files and streaming URLs" })] }), _jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx("div", { className: "app-content", children: _jsx("p", { children: "Welcome to Music Manager" }) }) }) })] }) }));
}
export default App;
