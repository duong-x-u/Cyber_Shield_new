import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Switch, Button, Alert, NativeModules, DeviceEventEmitter, ScrollView, TouchableOpacity } from 'react-native';
import InputBox from '../components/InputBox';
import ResultCard from '../components/ResultCard';
import LoadingOverlay from '../components/LoadingOverlay';
import Clipboard from '@react-native-community/clipboard';
import { Animated } from 'react-native';

const { ControlModule } = NativeModules;
const API_URL = 'https://cybershield-backend-renderserver.onrender.com/api/analyze';
const ANALYSIS_TIMEOUT = 20000; // 20 giây

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// --- Cải tiến UX ---
const LOADING_MESSAGES = [
    'Đang gửi yêu cầu đến máy chủ... 📡',
    'Phân tích sơ bộ nội dung... 📝',
    'Kiểm tra trong cơ sở dữ liệu... 🗃️',
    'Gửi đến chuyên gia AI phân tích sâu... 🧠',
    'Đối chiếu với các mẫu lừa đảo đã biết... 🎣',
    'Sắp có kết quả, vui lòng chờ... ✨',
];
// --- Hết phần cải tiến ---

const openAppSettings = async (settingType: 'notification' | 'usage') => {
    try {
        await ControlModule.openSpecificAppSettings(settingType);
    } catch (e: any) {
        if (e.code === 'E_USAGE_ACCESS_NOT_FOUND') {
            Alert.alert(
                'Hướng Dẫn Cấp Quyền Thủ Công',
                `Không thể mở trực tiếp. Vui lòng cấp quyền thủ công theo các đường dẫn phổ biến dưới đây:\n\n                📱 OPPO / Realme:\n                Cài đặt > Quản lý ứng dụng > Truy cập ứng dụng đặc biệt > Truy cập dữ liệu sử dụng\n\n                📱 Samsung:\n                Cài đặt > Ứng dụng > (dấu 3 chấm ⋮) > Truy cập đặc biệt > Quyền truy cập sử dụng\n\n                📱 Xiaomi:\n                Cài đặt > Bảo vệ quyền riêng tư > Quyền đặc biệt > Truy cập dữ liệu sử dụng\n\n                📱 Android Gốc (Pixel, ...):\n                Cài đặt > Ứng dụng > Quyền truy cập đặc biệt của ứng dụng > Truy cập dữ liệu sử dụng\n\n                (Tên các mục có thể thay đổi một chút tùy phiên bản)`,
                [{ text: 'Đã hiểu' }]
            );
        } else {
            Alert.alert('Lỗi', `Không thể mở màn hình Cài đặt. Vui lòng thử cấp quyền thủ công trong Cài đặt của máy.\nLỗi: ${e.message}`);
        }
    }
};

export default function HomeScreen() {
    const [inputText, setInputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const [isProtectionEnabled, setIsProtectionEnabled] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // --- Cải tiến UX: Cập nhật message khi loading ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            let messageIndex = 0;
            setLoadingMessage(LOADING_MESSAGES[0]); // Reset to first message
            interval = setInterval(() => {
                messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
                setLoadingMessage(LOADING_MESSAGES[messageIndex]);
            }, 1500); // Đổi message mỗi 1.5 giây
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isLoading]);
    // --- Hết phần cải tiến ---

    useEffect(() => {
        const processTextSubscription = DeviceEventEmitter.addListener('onProcessText', async (event) => {
            const text = event.text;
            if (text) {
                setInputText(text);
                handleAnalysis(text, true);
            }
        });

        return () => {
            processTextSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (analysisResult) {
            Animated.timing(
                fadeAnim,
                {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }
            ).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [analysisResult, fadeAnim]);

    const handleAnalysis = async (text: string, isAuto: boolean = false) => {
        if (!text.trim()) {
            if (!isAuto) Alert.alert("Lỗi", "Vui lòng nhập nội dung cần phân tích.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const urls = text.match(URL_REGEX) || [];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text, urls: urls }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Đọc response một lần duy nhất
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Lỗi máy chủ: ${response.status}`);
            }

            setAnalysisResult(result.result);

            if (isAuto) {
                ControlModule.showAnalysisNotification(result.result);
            }

        } catch (e: any) {
            clearTimeout(timeoutId);
            let errorMessage = 'Đã có lỗi xảy ra khi kết nối tới máy chủ.';
            if (e.name === 'AbortError') {
                errorMessage = 'Yêu cầu phân tích đã hết thời gian. Vui lòng thử lại.';
            }
            setError(errorMessage);
            if (!isAuto) {
                Alert.alert("Lỗi Phân Tích", errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setInputText('');
        setAnalysisResult(null);
        setError(null);
    };

    const handlePaste = async () => {
        const clipboardContent = await Clipboard.getString();
        if (clipboardContent) {
            setInputText(clipboardContent);
            Alert.alert("Dán thành công", "Nội dung từ clipboard đã được dán vào ô nhập liệu.");
        } else {
            Alert.alert("Lỗi", "Clipboard rỗng hoặc không có nội dung văn bản.");
        }
    };

    const toggleProtection = async (value: boolean) => {
        if (value) {
            try {
                const permissions = await ControlModule.checkPermissions();
                if (!permissions.notificationAccess) {
                    Alert.alert(
                        'Thiếu quyền quan trọng',
                        'Để bật bảo vệ tự động, bạn cần cấp quyền "Truy cập Thông báo".\n\nVui lòng vào mục cấp quyền bên dưới để bật.',
                        [{ text: 'Đã hiểu' }]
                    );
                    return;
                }

                Alert.alert(
                    'Xác nhận Bật Bảo vệ',
                    'Bạn có chắc chắn muốn bật tính năng quét thông báo và clipboard tự động không?',
                    [
                        { text: 'Hủy', style: 'cancel' },
                        {
                            text: 'OK, Bật',
                            onPress: () => {
                                ControlModule.startControlService();
                                setIsProtectionEnabled(true);
                            }
                        }
                    ]
                );

            } catch (err) {
                Alert.alert("Lỗi", "Không thể kiểm tra quyền của ứng dụng.");
            }
        } else {
            ControlModule.stopControlService();
            setIsProtectionEnabled(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <LoadingOverlay visible={isLoading} message={loadingMessage} />
            <Text style={styles.title}>CyberShield</Text>
            <Text style={styles.description}>
                Nhập hoặc dán tin nhắn, đường link đáng ngờ vào ô dưới đây để kiểm tra.
            </Text>
            <InputBox value={inputText} onChange={setInputText} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, isLoading && styles.actionButtonDisabled]} onPress={() => handleAnalysis(inputText)} disabled={isLoading}>
                    <Text style={styles.actionButtonText}>KIỂM TRA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, isLoading && styles.actionButtonDisabled]} onPress={handlePaste} disabled={isLoading}>
                    <Text style={styles.actionButtonText}>DÁN TỪ CLIPBOARD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.clearActionButton, isLoading && styles.actionButtonDisabled]} onPress={handleClear} disabled={isLoading}>
                    <Text style={styles.actionButtonText}>XÓA NỘI DUNG</Text>
                </TouchableOpacity>
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            {analysisResult && (
                <Animated.View style={{ opacity: fadeAnim }}>
                    <ResultCard result={analysisResult} />
                </Animated.View>
            )}

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Bảo Vệ Tự Động</Text>
                <Text style={styles.cardDescription}>
                    Tự động quét tin nhắn từ Zalo, Messenger... và cảnh báo nếu có nguy hiểm.
                </Text>
                <View style={styles.switchContainer}>
                    <Text style={[styles.status, { color: isProtectionEnabled ? '#66BB6A' : '#EF5350' }]}>
                        {isProtectionEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isProtectionEnabled ? '#1976D2' : '#f4f3f4'}
                        onValueChange={toggleProtection}
                        value={isProtectionEnabled}
                    />
                </View>
                <Text style={styles.permissionDescription}>
                    Nếu tính năng không hoạt động, hãy cấp đủ quyền cho ứng dụng:
                </Text>
                <View style={styles.permissionButtonContainer}>
                    <TouchableOpacity style={styles.permissionActionButton} onPress={() => openAppSettings('notification')}>
                        <Text style={styles.permissionActionButtonText}>Quyền Thông Báo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.permissionActionButton} onPress={() => openAppSettings('usage')}>
                        <Text style={styles.permissionActionButtonText}>Quyền Sử Dụng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F0F8FF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333333',
    },
    description: {
        fontSize: 16,
        color: '#606770',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    buttonContainer: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    actionButton: {
        backgroundColor: '#A7D9F0',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        flex: 1,
        margin: 5,
        alignItems: 'center',
        minWidth: 120,
    },
    actionButtonText: {
        color: '#333333',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    clearActionButton: {
        backgroundColor: '#D8BFD8',
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    errorText: {
        color: '#D32F2F',
        textAlign: 'center',
        marginVertical: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333333',
    },
    cardDescription: {
        fontSize: 15,
        color: '#606770',
        lineHeight: 22,
        marginBottom: 16,
    },
    permissionDescription: {
        fontSize: 14,
        color: '#606770',
        lineHeight: 20,
        marginTop: 16,
        textAlign: 'center',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e4e6eb',
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusGranted: {
        color: '#66BB6A',
    },
    statusDenied: {
        color: '#EF5350',
    },
    serviceButtonActive: {
        backgroundColor: '#66BB6A',
    },
    serviceButtonInactive: {
        backgroundColor: '#EF5350',
    },
    permissionButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    permissionActionButton: {
        backgroundColor: '#B2EBF2',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    permissionActionButtonText: {
        color: '#333333',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});