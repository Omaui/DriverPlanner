import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Corrida } from "../types";
// --- CONFIGURAÇÃO DE NOTIFICAÇÕES (MÁXIMA PRIORIDADE) ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // Faltava este
    shouldShowList: true,   // Faltava este
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});
export default function HomeScreen() {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);
  const [recorrente, setRecorrente] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState(new Date());
  const [corridas, setCorridas] = useState<Corrida[]>([]);

  const diasDaSemanaNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // --- LIMPEZA AUTOMÁTICA DE CORRIDAS ÚNICAS ---
  const carregarELimparCorridas = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem("corridas");
      if (dados) {
        const lista: Corrida[] = JSON.parse(dados);
        const agora = new Date();
        const diaHoje = agora.getDay();
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

        let mudou = false;
        const listaFiltrada = lista.filter(c => {
          if (c.recorrente) return true;

          const [h, m] = c.horario.split(":").map(Number);
          const minutosCorrida = h * 60 + m;

          // Se a corrida era para um dia que já passou ou hoje mais cedo
          const diaDaCorrida = c.diasSemana[0];
          
          if (diaDaCorrida < diaHoje || (diaDaCorrida === diaHoje && minutosAgora > minutosCorrida)) {
            mudou = true;
            return false;
          }
          return true;
        });

        if (mudou) {
          await AsyncStorage.setItem("corridas", JSON.stringify(listaFiltrada));
        }
        setCorridas(listaFiltrada);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarELimparCorridas();
    }, [carregarELimparCorridas])
  );

  // --- AGENDAMENTO ---
  async function agendar(corrida: { cliente: string; horario: string; dia: number }) {
    const [h, m] = corrida.horario.split(":").map(Number);
    const triggerDia = corrida.dia + 1; // Ajuste para o padrão do sistema

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚗 Corrida agora!",
        body: `Cliente: ${corrida.cliente}`,
        sound: Platform.OS === 'ios' ? 'default' : 'default', // iOS não permite sons personalizados longos sem arquivos locais
        priority: 'max',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: triggerDia,
        hour: h,
        minute: m,
      },
    });
  }

  async function salvar() {
    if (!cliente || diasSelecionados.length === 0) return Alert.alert("Erro", "Preencha tudo.");

    const horario = `${horaSelecionada.getHours().toString().padStart(2, "0")}:${horaSelecionada.getMinutes().toString().padStart(2, "0")}`;
    const baseId = Date.now().toString();

    try {
      const existentes = await AsyncStorage.getItem("corridas");
      const lista = existentes ? JSON.parse(existentes) : [];

      for (const dia of diasSelecionados) {
        const notifId = await agendar({ cliente, horario, dia });
        lista.push({
          id: `${baseId}-${dia}`,
          cliente,
          horario,
          diasSemana: [dia],
          recorrente,
          notificacoesIds: [notifId]
        });
      }

      await AsyncStorage.setItem("corridas", JSON.stringify(lista));
      setCliente("");
      setDiasSelecionados([]);
      carregarELimparCorridas();
      Alert.alert("Sucesso", "Corrida agendada!");
    } catch (e) {
      Alert.alert("Erro ao salvar");
    }
  }

  const hoje = new Date().getDay();
  const corridasHoje = corridas.filter(c => c.diasSemana.includes(hoje));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>🚗 Próximas de Hoje</Text>
      {corridasHoje.length === 0 ? (
        <Text style={styles.sub}>Sem compromissos para hoje.</Text>
      ) : (
        corridasHoje.map(c => (
          <View key={c.id} style={styles.hojeCard}>
            <Text style={styles.hojeTexto}>{c.horario} - {c.cliente} {c.recorrente ? "(R)" : ""}</Text>
          </View>
        ))
      )}

      <View style={styles.divisor} />

      <Text style={styles.label}>Cliente</Text>
      <TextInput style={styles.input} value={cliente} onChangeText={setCliente} placeholder="Nome do passageiro" />

      <View style={styles.row}>
        <Text style={styles.label}>Horário</Text>
        <DateTimePicker value={horaSelecionada} mode="time" is24Hour onChange={(e, d) => d && setHoraSelecionada(d)} />
      </View>

      <Text style={styles.label}>Dias</Text>
      <View style={styles.diasContainer}>
        {diasDaSemanaNomes.map((n, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => setDiasSelecionados(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
            style={[styles.diaBtn, diasSelecionados.includes(i) && styles.diaBtnAtivo]}
          >
            <Text style={{ color: diasSelecionados.includes(i) ? "#fff" : "#444" }}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Repetir semanalmente</Text>
        <Switch value={recorrente} onValueChange={setRecorrente} />
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
        <Text style={styles.btnTexto}>SALVAR AGENDAMENTO</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.btnSecundario} 
        onPress={() => router.push("/corridas")}
      >
        <Text style={styles.btnSecundarioTexto}>VER TODA A AGENDA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "800", marginTop: 40, marginBottom: 10, color: "#1a1a1a" },
  sub: { color: "#888", marginBottom: 20, fontStyle: "italic" },
  hojeCard: { backgroundColor: "#f0f4ff", padding: 15, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#007AFF" },
  hojeTexto: { fontWeight: "700", color: "#0056b3", fontSize: 16 },
  divisor: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 30 },
  label: { fontWeight: "700", marginBottom: 10, color: "#333", fontSize: 15 },
  input: { backgroundColor: "#f8f8f8", padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#eee" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  diasContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 15 },
  diaBtn: { width: "23%", paddingVertical: 12, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, alignItems: "center", marginBottom: 10, backgroundColor: "#fdfdfd" },
  diaBtnAtivo: { backgroundColor: "#1a1a1a", borderColor: "#1a1a1a" },
  btnSalvar: { backgroundColor: "#00c853", padding: 20, borderRadius: 15, alignItems: "center", marginTop: 10, elevation: 2 },
  btnTexto: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnSecundario: { marginTop: 20, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#007AFF", alignItems: "center" },
  btnSecundarioTexto: { color: "#007AFF", fontWeight: "700" }
});