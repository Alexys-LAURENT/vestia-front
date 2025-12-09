import { BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useImagePicker } from '../media-gallery';
import { Sheet, useSheetRef } from "./Sheet";
interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemSheet = ({ isOpen, onClose }: AddItemSheetProps) => {
  const sheetRef = useSheetRef();;

  React.useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, sheetRef]);


  const {pick} = useImagePicker();
  const pickImage = async () => {
    const image = await pick({
      allowedMediaTypes: 'photo',
      allowMultipleSelection: false,
      enableCrop:false,
      excludedExtensions: ["gif","heic"],
      stackBehavior: 'push',

    })
  }

  return (
   <Sheet
        ref={sheetRef}
        onDismiss={onClose}
      >
        <BottomSheetView style={styles.contentContainer}>
          <TouchableOpacity
          onPress={pickImage}
          >
            <Text>

            Pick image 🎉
            </Text>
            </TouchableOpacity>
        </BottomSheetView>
      </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});

export default AddItemSheet;