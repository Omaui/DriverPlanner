import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Corrida } from "./types";

export default function CorridasScreen() {
  const [corridas, setCorridas] = useState<Corrida[]>([]);

  // --- BLOCO: CARREGAMENTO ---
  const carregarCorridas = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem("corridas");
      if (dados) setCorridas(JSON.parse(dados));
    } catch (error) {
      console.error("Erro ao carregar:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarCorridas();
    }, [carregarCorridas])
  );

  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // --- BLOCO: EXCLUSÃO ---
  async function excluirCorrida(id: string) {
    Alert.alert("Excluir", "Deseja remover este alerta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            const corridaParaRemover = corridas.find(c => c.id === id);

            // Cancelar todos os gatilhos de notificação vinculados a esta corrida
            if (corridaParaRemover?.notificacoesIds) {
              await Promise.all(
                corridaParaRemover.notificacoesIds.map(nId => 
                  Notifications.cancelScheduledNotificationAsync(nId)
                )
              );
            }

            const novaLista = corridas.filter(c => c.id !== id);
            await AsyncStorage.setItem("corridas", JSON.stringify(novaLista));
            setCorridas(novaLista);
          } catch (e) {
            Alert.alert("Erro", "Falha ao excluir.");
          }
        }
      }
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Minha Agenda</Text>

      {corridas.length === 0 && <Text style={styles.vazio}>Nenhum agendamento ativo.</Text>}

      {diasSemana.map((dia, index) => {
        const filtradas = corridas
          .filter(c => c.diasSemana.includes(index))
          .sort((a, b) => a.horario.localeCompare(b.horario));

        if (filtradas.length === 0) return null;

        return (
          <View key={index} style={styles.diaSection}>
            <Text style={styles.diaTitulo}>{dia}</Text>
            {filtradas.map(corrida => (
              <View key={corrida.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cliente}>{corrida.cliente}</Text>
                  <Text style={styles.horario}>{corrida.horario}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={corrida.recorrente ? styles.tagRecorrente : styles.tagUnica}>
                    {corrida.recorrente ? "🔄 Semanal" : "📍 Única"}
                  </Text>
                  <TouchableOpacity onPress={() => excluirCorrida(corrida.id)}>
                    <Text style={styles.btnExcluir}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  diaSection: { marginBottom: 25 },
  diaTitulo: { fontSize: 14, fontWeight: "bold", color: "#888", textTransform: "uppercase", marginBottom: 8 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  cliente: { fontSize: 16, fontWeight: "600" },
  horario: { fontSize: 16, fontWeight: "bold", color: "#2196F3" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 10 },
  tagRecorrente: { color: "#2E7D32", fontSize: 12, fontWeight: "600" },
  tagUnica: { color: "#E65100", fontSize: 12, fontWeight: "600" },
  btnExcluir: { color: "#D32F2F", fontWeight: "bold" },
  vazio: { textAlign: "center", marginTop: 50, color: "#999" }
});