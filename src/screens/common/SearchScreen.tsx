import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
          <Icon name="arrow-back" size={24} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
        <TouchableOpacity>
          <Icon name="more-vert" size={24} color={colors.darkText} />
        </TouchableOpacity>
      </View>

      {hasSearched && (
        <Text style={styles.subtitle}>
          Showing results for: '{searchQuery}'
        </Text>
      )}

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.mediumGray} style={styles.searchIcon} />
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
            <Icon name="close" size={18} color={colors.mediumGray} />
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
              icon="search"
              title="No Results Found"
              description="Try adjusting your search filters"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="search"
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
  title: {
    ...typography.sectionHeader,
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
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
  },
  list: {
    padding: spacing.base,
  },
  emptyContainer: {
    flex: 1,
  },
});












