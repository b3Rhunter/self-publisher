import React from "react";
import { Typography } from "antd";
import Logo from "../images/opinion.svg";


const { Title, Text } = Typography;

// displays a page header

export default function Header({ link, title, subTitle, ...props }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem", backgroundColor: "#121212", borderBottom: "1px solid #fff", position: "fixed", top: "0", width: "100%", zIndex: "10"}}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "start" }}>
        <a href="/">
          <Title level={4} style={{ margin: "0 24px 0 0" }}>
            <span className="title" style={{position: "absolute", top: "20px", left: "10px", fontFamily: "monospace", fontSize: "1.25em"}}>
            Self Publisher
            </span>
          </Title>
        </a>
      </div>
      {props.children}
    </div>
  );
}
