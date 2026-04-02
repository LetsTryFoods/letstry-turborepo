import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import { CREATE_ADDRESS, GET_MY_ADDRESSES } from '../../src/lib/graphql/address';
import { wp, RFValue } from '../../src/lib/utils/ui-utils';

const addressSchema = z.object({
  recipientName: z.string().min(2, 'Name is too short'),
  recipientPhone: z.string().length(10, 'Phone must be 10 digits'),
  buildingName: z.string().min(1, 'Building/House name is required'),
  floor: z.string().optional(),
  street: z.string().min(1, 'Street/Area is required'),
  landmark: z.string().optional(),
  label: z.enum(['Home', 'Work', 'Other']),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [createAddress, { loading: creatingAddress }] = useMutation(CREATE_ADDRESS, {
    refetchQueries: [{ query: GET_MY_ADDRESSES }],
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'Home',
      street: params.address as string || '',
    },
  });

  // Pre-fill fields once params are available
  React.useEffect(() => {
    if (params.address) setValue('street', params.address as string);
  }, [params.address]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      // 1. Create the address
      const addressResult = await createAddress({
        variables: {
          input: {
            addressType: data.label,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            buildingName: data.buildingName,
            floor: data.floor,
            streetArea: data.street,
            landmark: data.landmark,
            addressLocality: (params.locality as string) || 'Delhi',
            addressRegion: (params.region as string) || 'Delhi',
            postalCode: (params.postalCode as string) || '110001',
            addressCountry: (params.country as string) || 'India',
            latitude: parseFloat(params.latitude as string) || 0,
            longitude: parseFloat(params.longitude as string) || 0,
            formattedAddress: (params.address as string) || '',
            isDefault: true,
          }
        }
      });

      const addressId = addressResult.data.createAddress._id;

      // 2. Navigate to summary (payment will be initiated there)
      router.push({
        pathname: '/checkout/summary',
        params: { addressId },
      });

    } catch (err: any) {
      console.error('[Address Error]', err);
      Alert.alert('Error', err.message || 'Could not save address. Please try again.');
    }
  };

  const isProcessing = creatingAddress;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Address Details</Text>
        </View>

        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Recipient Details</Text>

          <Text style={styles.label}>Full Name *</Text>
          <Controller
            control={control}
            name="recipientName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.recipientName && styles.inputError]}
                placeholder="Ex: John Doe"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.recipientName && <Text style={styles.errorText}>{errors.recipientName.message}</Text>}

          <Text style={styles.label}>Mobile Number *</Text>
          <Controller
            control={control}
            name="recipientPhone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.recipientPhone && styles.inputError]}
                placeholder="10-digit mobile number"
                keyboardType="numeric"
                maxLength={10}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.recipientPhone && <Text style={styles.errorText}>{errors.recipientPhone.message}</Text>}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Address Information</Text>

          <Text style={styles.label}>Flat / House No / Building *</Text>
          <Controller
            control={control}
            name="buildingName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.buildingName && styles.inputError]}
                placeholder="Ex: 102, Green Apartments"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.buildingName && <Text style={styles.errorText}>{errors.buildingName.message}</Text>}

          <Text style={styles.label}>Floor / Block (Optional)</Text>
          <Controller
            control={control}
            name="floor"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Ex: 4th Floor"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Text style={styles.label}>Area / Street *</Text>
          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.street && styles.inputError]}
                placeholder="Nearby street or area"
                value={value}
                onChangeText={onChange}
                multiline
              />
            )}
          />
          {errors.street && <Text style={styles.errorText}>{errors.street.message}</Text>}

          <Text style={styles.label}>Landmark (Optional)</Text>
          <Controller
            control={control}
            name="landmark"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Ex: Near Apollo Hospital"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Text style={styles.label}>Save As</Text>
          <View style={styles.tagContainer}>
            {(['Home', 'Work', 'Other'] as const).map((tag) => (
              <Controller
                key={tag}
                control={control}
                name="label"
                render={({ field: { value, onChange } }) => (
                  <TouchableOpacity
                    style={[
                      styles.tag,
                      value === tag && styles.tagActive
                    ]}
                    onPress={() => onChange(tag)}
                  >
                    <Ionicons
                      name={tag === 'Home' ? 'home' : tag === 'Work' ? 'briefcase' : 'location'}
                      size={16}
                      color={value === tag ? '#fff' : '#666'}
                    />
                    <Text style={[styles.tagText, value === tag && styles.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, isProcessing && styles.disabledBtn]}
            onPress={handleSubmit(onSubmit)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save & Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#222',
    marginLeft: 12,
  },
  formContainer: {
    paddingHorizontal: wp('5%'),
    paddingTop: wp('5%'),
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#0fa958',
    marginBottom: wp('4%'),
  },
  label: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: RFValue(14),
    color: '#222',
    marginBottom: wp('4%'),
  },
  inputError: {
    borderColor: '#ff4b2b',
  },
  errorText: {
    fontSize: RFValue(11),
    color: '#ff4b2b',
    marginTop: -wp('3%'),
    marginBottom: wp('3%'),
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: wp('4%'),
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: wp('6%'),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tagActive: {
    backgroundColor: '#0C5273',
    borderColor: '#0C5273',
  },
  tagText: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  tagTextActive: {
    color: '#fff',
  },
  footer: {
    padding: wp('5%'),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#0C5273',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
});
