import notificationSound from "../assets/sounds/notification.mp3";

export function playNotification() {
  const audio = new Audio(notificationSound);

  audio.volume = 0.7;

  audio.play().catch((error) => {
    console.error("Erro ao reproduzir som:", error);
  });
}