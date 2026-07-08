import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useIsWideScreen } from '../hooks/useIsWideScreen';
import { useNavigation } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
}

export const ResponsiveDetailContainer = ({ children }: Props) => {
  const isWide = useIsWideScreen();
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  useEffect(() => {
    if (!isWide) bottomSheetRef.current?.expand();
  }, [isWide]);

  const handleClose = () => navigation.goBack();

  if (isWide) {
    return (
      <Modal transparent animationType="fade" visible onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>{children}</View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <View style={styles.sheetContainer}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>{children}</BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContent: { flex: 1, padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '60%', backgroundColor: 'white', borderRadius: 12, padding: 24, maxHeight: '80%' },
});
