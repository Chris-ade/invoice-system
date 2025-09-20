"use client";

import React, { useEffect, useState } from "react";

type LoadingBarProps = {
  isContent?: boolean;
  text?: string;
  isFull?: boolean;
  show?: boolean;
};

const ActivityIndicator: React.FC<LoadingBarProps> = ({
  isContent = false,
  text = "Loading...",
  isFull = false,
  show = false,
}) => {
  const [loadingBarWidth, setLoadingBarWidth] = useState("0%");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (show) {
      // Start the bar animation
      setLoadingBarWidth("100%");
      timeoutId = setTimeout(() => {
        // After animation completes (simulate finish), reset bar
        setLoadingBarWidth("0%");
      }, 1500); // You can tweak this duration
    } else {
      setLoadingBarWidth("0%");
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [show]);

  return (
    <>
      {isContent ? (
        <div className={`is-loading ${isFull ? "full" : ""}`}>
          <span>{text}</span>
          <div className="progress-loading">
            <div className="indeterminate"></div>
          </div>
        </div>
      ) : (
        <div
          className="progress-loading"
          id="loading-bar"
          style={{ width: loadingBarWidth }}
        >
          <div className="indeterminate"></div>
        </div>
      )}
    </>
  );
};

export default ActivityIndicator;
