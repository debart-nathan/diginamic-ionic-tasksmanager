import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import TaskList from '../components/TasksList/TasksList';
const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Liste des Taches</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Liste des Taches</IonTitle>
          </IonToolbar>
        </IonHeader>
        <TaskList />
      </IonContent>
    </IonPage>
  );
};

export default Home;
