import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlanStore, TechniqueStatus } from '../store/planStore';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ResponsiveDetailContainer } from '../components/ResponsiveDetailContainer';
import { resourceRenderers } from '../components/resourceRenderers';

export default function TechniqueDetailScreen() {
  const route = useRoute<RouteProp<any, 'TechniqueDetail'>>();
  const navigation = useNavigation();
  const { technique } = route.params as any;
  const { updateTechniqueStatus, techniqueStatus } = usePlanStore();

  const currentStatus = techniqueStatus[technique.title] || 'pending';
  const ResourceBlock = resourceRenderers[technique.resourceType];

  const handleStatusChange = (status: TechniqueStatus) => {
    updateTechniqueStatus(technique.title, status);
    navigation.goBack();
  };

  return (
    <ResponsiveDetailContainer>
      <Text style={styles.title}>{technique.title}</Text>
      <Text style={styles.why}>{technique.why}</Text>
      
      {ResourceBlock && <ResourceBlock technique={technique} />}

      <View style={styles.buttonContainer}>
        {currentStatus !== 'in_progress' && (
          <TouchableOpacity style={[styles.button, styles.inProgress]} onPress={() => handleStatusChange('in_progress')}>
            <Text style={styles.btnText}>In Progress</Text>
          </TouchableOpacity>
        )}
        {currentStatus !== 'mastered' && (
          <TouchableOpacity style={[styles.button, styles.mastered]} onPress={() => handleStatusChange('mastered')}>
            <Text style={styles.btnText}>Mastered</Text>
          </TouchableOpacity>
        )}
        {currentStatus !== 'not_for_me' && (
          <TouchableOpacity style={[styles.button, styles.skipped]} onPress={() => handleStatusChange('not_for_me')}>
            <Text style={styles.btnText}>Not For Me</Text>
          </TouchableOpacity>
        )}
      </View>
    </ResponsiveDetailContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
  why: { fontSize: 16, marginBottom: 20, color: '#4B5563', lineHeight: 24 },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, flexGrow: 1, alignItems: 'center' },
  inProgress: { backgroundColor: '#F59E0B' },
  mastered: { backgroundColor: '#10B981' },
  skipped: { backgroundColor: '#EF4444' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
