import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import AmharicText from '../src/components/AmharicText';

const ClickableBibleVerse = ({ verse, text, explanation, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <>
      <TouchableOpacity onPress={openModal} activeOpacity={0.7}>
        <AmharicText style={[styles.verseLink, style]}>
          {verse}
        </AmharicText>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AmharicText variant="subheading" style={styles.modalTitle}>
                {verse}
              </AmharicText>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <AmharicText style={styles.closeIcon}>✕</AmharicText>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.verseContainer}>
                <AmharicText variant="body" style={styles.verseText}>
                  {text}
                </AmharicText>
              </View>
              
              {explanation && (
                <View style={styles.explanationContainer}>
                  <AmharicText variant="caption" style={styles.explanationLabel}>
                    ማብራሪያ:
                  </AmharicText>
                  <AmharicText variant="body" style={styles.explanationText}>
                    {explanation}
                  </AmharicText>
                </View>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  verseLink: {
    color: '#654321',
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F5F5DC',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#DEB887',
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DEB887',
    backgroundColor: '#654321',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  verseContainer: {
    marginBottom: 20,
  },
  verseText: {
    fontSize: 16,
    color: '#8B4513',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  explanationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#DEB887',
    paddingTop: 16,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  explanationText: {
    fontSize: 16,
    color: '#A0522D',
    lineHeight: 24,
  },
});

export default ClickableBibleVerse;


