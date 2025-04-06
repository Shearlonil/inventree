import { useCallback, useEffect, useRef } from "react";

const SCANNER_FILTER_DELAY_MS = 6;
const SCANNER_FILTER_SOFT_DELAY_MS = 30;

//  ref:    https://medium.com/@elie_3904/seamless-web-integration-of-usb-code-scanners-with-react-js-7fef44ea71e4
export const useNumericCodeScanner = ( onCodeScan ) => {
    const lastKeyPressTimeRef = useRef(0);

    const scannerInputRef = useRef('');

    const handleKeyDown = useCallback( (event) => {
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - lastKeyPressTimeRef.current;

        // Block keydown event if the time difference is smaller than the "hard" filter delay.
        // This way, the pressed key won't affect any text input.
        if (timeDifference <= SCANNER_FILTER_DELAY_MS) {
            event.preventDefault();
        }

        // Keep the key value in the input sequence only if the time difference is lower than the
        // soft filter delay.
        // This distinct filter param enables to keep more inputs, even if the scanner has an unexpected
        // transmitting delay.
        if (timeDifference > SCANNER_FILTER_SOFT_DELAY_MS) {
            scannerInputRef.current = '';
        } else {
            if (event.code === "Enter") {
                onCodeScan(scannerInputRef.current);
                scannerInputRef.current = '';
            }
            scannerInputRef.current += event.key;
        }

        lastKeyPressTimeRef.current = currentTime;
    }, [onCodeScan], );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}