import { Camera, CameraView } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native'; // Ensure StyleSheet is imported


//API config
const API_URL = 'https://erp.ayaanmr.com/urlapi/api/url/getapi';
const API_KEY = "TESTKEYITM";
const UID = "API";
const UPW = "ba1234";

const BarcodeScannerScreen = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedId, setScannedId] = useState(null);
    const [ItemDetails, setItemDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    //Custom Alert Helper
    const showCustomAlert = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };
        //QR code scanning
    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        setScannedId(null);
        setItemDetails(null);
        setError(null);
       
       const id = parseInt(data, 10);
        if (isNaN(id)) {
            showCustomAlert('Invalid QR code scanned');
            return;
        }
        setScannedId(id);
        await fetchItemDetails(id);
    };

    //connecting Backend....
    const fetchItemDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_URL}?api_key=${API_KEY}&uid=${UID}&upw=${UPW}&id=${id}`;
            console.log('Fetching URL:', url);
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} ${errorText}`);
            }
            const result = await response.json();
            console.log('API Response:', result);

            if (Array.isArray(result) && result.length > 0) {
                setItemDetails(result[0]);
            } else {
                showCustomAlert('No data found for the scanned ID');
                setItemDetails(null);
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            setError('Failed to fetch item details. Please try again.', error.message);
            showCustomAlert('Failed to fetch item details.' + error.message);
        } finally {
            setLoading(false);
        }
    };

//display msg based on camera permission
    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}> {/* This container will manage the overall white background */}
            <View style={styles.cameraWrapper}> {/* Wrapper for the fixed-size camera and its overlay */}
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "pdf417", "ean13", "code128"],
                    }}
                    style={StyleSheet.absoluteFillObject} // CameraView now fills its *wrapper*
                />

                {/* Overlay for the square scanning area, now relative to cameraWrapper */}
                <View style={styles.innerOverlay}>
                    <View style={styles.unfocusedContainerTopBottom} />
                    <View style={styles.middleContainer}>
                        <View style={styles.unfocusedContainerLeftRight} />
                        <View style={styles.focusedContainer} />
                        <View style={styles.unfocusedContainerLeftRight} />
                    </View>
                    <View style={styles.unfocusedContainerTopBottom} />
                </View>
            </View>

            {scanned && (
                // Wrap the Button in a View to apply styles to its container
                <View style={styles.scanAgainButton}>
                    <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // This makes the background outside the camera white
    },
    cameraWrapper: {
        width: 250, // Fixed width for the camera area
        height: 250, // Fixed height for the camera area
        overflow: 'hidden', // Crucial to clip the camera feed to this size
        borderRadius: 10, // Optional: gives a slightly rounded look
        position: 'relative', // Needed for absolute positioning of CameraView
    },
    innerOverlay: {
        ...StyleSheet.absoluteFillObject, // This overlay fills the cameraWrapper
        justifyContent: 'center',
        alignItems: 'center',
    // Using distinct styles for top/bottom and left/right unfocused areas for clarity
    unfocusedContainerTopBottom: {
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', // Dimmed effect around the central square
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250, // Height of the "focused" row (should match cameraWrapper height)
    },
    unfocusedContainerLeftRight: {
        flex: 1, // Takes remaining horizontal space
        backgroundColor: 'rgba(0,0,0,0.6)', // Dimmed effect around the central square
    },
    focusedContainer: {
        width: 250, // Width of the square scanning area (should match cameraWrapper width)
        borderWidth: 2,
        borderColor: '#00FF00', // Green border for the square
    },
    scanAgainButton: {
        marginTop: 20, // Add some space below the camera area
    }

}
});


export default BarcodeScannerScreen;