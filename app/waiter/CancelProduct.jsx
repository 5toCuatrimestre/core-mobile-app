import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { createCancelRequest, checkCancelRequestStatus, rejectCancelRequest, updateSellDetail } from '../../api/services/forWaiter';
import { StyleContext } from '../../utils/StyleContext';

export default function CancelProduct() {
  const { style } = useContext(StyleContext);
  const { sellDetailId, positionSiteId, name, nameWaiter, quantity, totalPlatillos, productId, sellId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [cancelQuantity, setCancelQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [sellDetailStatusId, setSellDetailStatusId] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Cancelar productos" });
  }, [navigation]);

  useEffect(() => {
    let interval;
    let countdownInterval;
    
    if (sellDetailStatusId) {
      // Iniciar el contador regresivo
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Verificar el estado de la solicitud
      interval = setInterval(async () => {
        try {
          const response = await checkCancelRequestStatus(sellDetailStatusId);
          console.log('Respuesta del estado:', response);
          
          if (response && response.type === 'SUCCESS' && response.result) {
            const status = response.result.status;
            if (status === 'ACCEPTED') {
              try {
                // Actualizar la cantidad en el detalle de venta
                const nuevaCantidad = parseInt(quantity) - cancelQuantity;
                console.log('Actualizando cantidad:', { sellDetailId, sellId, productId, nuevaCantidad });
                const updateResponse = await updateSellDetail(
                  sellDetailId,
                  sellId,
                  parseInt(productId),
                  nuevaCantidad
                );
                console.log('Respuesta de actualización:', updateResponse);
                
                if (updateResponse && updateResponse.type === 'SUCCESS') {
                  ToastAndroid.show('Cancelación aprobada y cantidad actualizada', ToastAndroid.SHORT);
                  router.back();
                } else {
                  ToastAndroid.show('Error al actualizar la cantidad', ToastAndroid.SHORT);
                  router.back();
                }
              } catch (updateError) {
                console.error('Error al actualizar cantidad:', updateError);
                ToastAndroid.show('Error al actualizar la cantidad', ToastAndroid.SHORT);
                router.back();
              }
            } else if (status === 'REJECTED') {
              ToastAndroid.show('La solicitud fue rechazada', ToastAndroid.SHORT);
              router.back();
            }
          }
        } catch (error) {
          console.error('Error al verificar estado:', error);
          ToastAndroid.show('Error al verificar el estado', ToastAndroid.SHORT);
        }
      }, 2000);

      // Timer de 15 segundos
      const timeout = setTimeout(async () => {
        if (sellDetailStatusId) {
          try {
            await rejectCancelRequest(sellDetailStatusId);
            ToastAndroid.show('La solicitud expiró', ToastAndroid.SHORT);
            router.back();
          } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            ToastAndroid.show('Error al rechazar la solicitud', ToastAndroid.SHORT);
            router.back();
          }
        }
      }, 15000);

      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
        clearTimeout(timeout);
      };
    }
  }, [sellDetailStatusId]);

  const handleCancel = async () => {
    if (cancelQuantity <= 0 || cancelQuantity > parseInt(totalPlatillos)) {
      ToastAndroid.show('Cantidad inválida', ToastAndroid.SHORT);
      return;
    }

    setProcessing(true);
    try {
      const response = await createCancelRequest(
        sellDetailId,
        positionSiteId,
        name,
        nameWaiter,
        'PENDING',
        cancelQuantity
      );

      if (response && response.type === 'SUCCESS' && response.result) {
        setSellDetailStatusId(response.result.sellDetailStatusId);
        setRequestSent(true);
        ToastAndroid.show('Solicitud de cancelación enviada', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Error al crear la solicitud', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error);
      ToastAndroid.show('Error al procesar la solicitud', ToastAndroid.SHORT);
    } finally {
      setProcessing(false);
    }
  };

  const handleIncrement = () => {
    if (cancelQuantity < parseInt(totalPlatillos)) {
      setCancelQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (cancelQuantity > 1) {
      setCancelQuantity(prev => prev - 1);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: style.BgInterface }]}>
      <View style={[styles.infoContainer, { backgroundColor: style.BgCard }]}>
        <Text style={[styles.label, { color: style.H2 }]}>Producto: {name}</Text>
        <Text style={[styles.label, { color: style.H2 }]}>Mesero: {nameWaiter}</Text>
        <Text style={[styles.label, { color: style.H2 }]}>Total de platillos: {totalPlatillos}</Text>
      </View>

      {!requestSent ? (
        <>
          <View style={[styles.quantityContainer, { backgroundColor: style.BgCard }]}>
            <Text style={[styles.label, { color: style.H2 }]}>Cantidad a cancelar:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, { backgroundColor: style.BgButton }]} 
                onPress={handleDecrement}
                disabled={processing}
              >
                <Text style={[styles.quantityButtonText, { color: style.P }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: style.H2 }]}>{cancelQuantity}</Text>
              <TouchableOpacity 
                style={[styles.quantityButton, { backgroundColor: style.H2 }]} 
                onPress={handleIncrement}
                disabled={processing}
              >
                <Text style={[styles.quantityButtonText, { color: style.P }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#2196F3' }]} 
            onPress={handleCancel}
            disabled={processing}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {processing ? 'Procesando...' : 'Solicitar Cancelación'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.statusContainer, { backgroundColor: style.BgCard }]}>
          <Text style={[styles.statusText, { color: style.H2 }]}>
            Solicitud enviada. Esperando respuesta...
          </Text>
        </View>
      )}

      {requestSent && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Esperando respuesta...</Text>
          <Text style={styles.countdownText}>Tiempo restante: {countdown} segundos</Text>
        </View>
      )}

      {processing && !requestSent && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Procesando solicitud...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  quantityContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  countdownText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 