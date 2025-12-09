import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertCard } from '../../components/alerts/AlertCard';
import { colors, typography, spacing } from '../../utils';
import { Alert } from '../../types/alert.types';

export const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Alert[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setHasSearched(true);
      // TODO: Implement actual search API call
      // For now, empty results
      setResults([]);
    } else {
      setHasSearched(false);
      setResults([]);
    }
  };

  const handleRespond = (alert: Alert) => {
    navigation.navigate('AlertResponse', { alert });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {hasSearched && (
        <Text style={styles.subtitle}>
          Showing results for: '{searchQuery}'
        </Text>
      )}

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search alerts, users, locations..."
          placeholderTextColor={colors.mediumGray}
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasSearched ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onRespond={handleRespond} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="No Results Found"
              description="Try adjusting your search filters"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="🔍"
            title="Search Alerts"
            description="Search for alerts, users, or locations"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  backIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  title: {
    ...typography.sectionHeader,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  subtitle: {
    ...typography.caption,
    fontStyle: 'italic',
    color: colors.mediumGray,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    color: colors.mediumGray,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
  },
  clearIcon: {
    fontSize: 18,
    color: colors.mediumGray,
    padding: spacing.xs,
  },
  list: {
    padding: spacing.base,
  },
  emptyContainer: {
    flex: 1,
  },
});












