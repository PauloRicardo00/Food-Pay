/**
 * Reproduz o som de notificação do sistema.
 * O erro é silenciado intencionalmente: navegadores bloqueiam autoplay
 * até que o usuário interaja com a página — não deve quebrar o fluxo.
 */
import notificationSound from "../assets/sounds/notification.mp3";

export function playNotification() {
  const audio = new Audio(notificationSound);
  audio.volume = 0.7;
  audio.play().catch((error) => {
    console.error("Erro ao reproduzir som de notificação:", error);
  });
}
