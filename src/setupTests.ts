import React from "react";

// Silence React warning when running in a non-browser environment
// by using useEffect instead of useLayoutEffect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(React as any).useLayoutEffect = React.useEffect;
