import React from "react";
interface SwitchToggleModeProps {
    mode: string;
    setMode: (mode: string) => void;
    modeList: string[];
    titleList: string[];
    onModeChange?: (mode: string) => void;
}

function SwitchToggleMode({
    mode,
    setMode,
    modeList,
    titleList,
    onModeChange,
}: SwitchToggleModeProps) {
    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                backgroundColor: "#F1F3F5",
                height: "50px",
                borderRadius: "12px",
                marginBottom: "15px"
            }}
        >
            <div
                style={{
                    padding: "5px",
                    width: "50%",
                    textAlign: "center",
                    margin: "7px",
                    backgroundColor: mode === modeList[0] ? "#4C6EF5" : "",
                    color: mode === modeList[0] ? "white" : "black",
                    borderRadius: "10px",
                    cursor: "pointer"
                }}
                onClick={() => {
                    if (onModeChange) onModeChange(modeList[0]);
                    setMode(modeList[0]);
                }}
            >
                {titleList[0]}
            </div>
            <div
                style={{
                    padding: "5px",
                    width: "50%",
                    textAlign: "center",
                    margin: "7px",
                    backgroundColor: mode === modeList[1] ? "#4C6EF5" : "",
                    color: mode === modeList[1] ? "white" : "black",
                    borderRadius: "10px",
                    cursor: "pointer"
                }}
                onClick={() => {
                    if (onModeChange) onModeChange(modeList[1]);
                    setMode(modeList[1]);
                }}
            >
                {titleList[1]}
            </div>
        </div>
    );
}

export default SwitchToggleMode;
