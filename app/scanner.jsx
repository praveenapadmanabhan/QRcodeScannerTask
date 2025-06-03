import { Camera, CameraView } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Import Modal and Image, TouchableOpacity

// API config
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

    const showCustomAlert = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true); // Set scanned to true immediately to pause scanning
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

    const fetchItemDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // Your existing API call logic
            const url = `${API_URL}?APIKEY=${API_KEY}&UID=${UID}&UPW=${UPW}&P1=${id}&P2=${id}&P3=&P4=`;
            console.log('Fetching URL:', url); //
            const response = await fetch(url); //
            if (!response.ok) { //
                const errorText = await response.text(); //
                throw new Error(`Error: ${response.status} ${errorText}`); //
            }
            const result = await response.json(); //
            console.log('API Response:', result); //

            if (Array.isArray(result) && result.length > 0) { //
                setItemDetails(result[0]); //
            } else {
                showCustomAlert('No data found for the scanned ID'); //
                setItemDetails(null); //
            }
        } catch (error) { //
            console.error('Error fetching item details:', error); //
            setError('Failed to fetch item details.'); //
            showCustomAlert('Failed to fetch item details. ' + error.message); //
        } finally {
            setLoading(false); //
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>; //
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>; //
    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraWrapper}>
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} //
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "pdf417", "ean13", "code128"], //
                    }}
                    style={StyleSheet.absoluteFillObject} //
                />

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

            {loading && <Text style={styles.statusText}>Loading item details...</Text>}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}

            {ItemDetails && (
                <View style={styles.itemDetailsContainer}>
                    <Text style={styles.detailTitle}>Scanned Item Details:</Text>
                    <Text style={styles.detailText}>Item ID: {ItemDetails.ItmID}</Text>
                    <Text style={styles.detailText}>Item Name: {ItemDetails.ItmName}</Text>
                    {ItemDetails.ItmThmbnl && (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${ItemDetails.ItmThmbnl}` }}
                            style={styles.itemImage}
                            resizeMode="contain"
                        />
                    )}
                    {/* Display other details if available and desired */}
                    {ItemDetails.OtherDetail1 && <Text style={styles.detailText}>Other Detail 1: {ItemDetails.OtherDetail1}</Text>}
                </View>
            )}

            {scanned && (
                <View style={styles.scanAgainButton}>
                    <Button title={'Tap to Scan Again'} onPress={() => {
                        setScanned(false);
                        setItemDetails(null); // Clear previous details when scanning again
                        setScannedId(null);
                        setError(null);
                    }} />
                </View>
            )}

            {/* Custom Alert Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.textStyle}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 20, // Add some vertical padding
    },
    cameraWrapper: {
        width: 250,
        height: 250,
        overflow: 'hidden',
        borderRadius: 10,
        position: 'relative',
        marginBottom: 20, // Add margin below camera
    },
    innerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unfocusedContainerTopBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    unfocusedContainerLeftRight: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    focusedContainer: {
        width: 250,
        borderWidth: 2,
        borderColor: '#00FF00',
    },
    scanAgainButton: {
        marginTop: 20,
    },
    statusText: {
        marginTop: 10,
        fontSize: 16,
        color: '#007bff',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    itemDetailsContainer: {
        marginTop: 20,
        padding: 20,
        width: '90%',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignItems: 'center',
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'center',
    },
    itemImage: {
        width: 150,
        height: 150,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    // Modal Styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16,
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
});

export default BarcodeScannerScreen;