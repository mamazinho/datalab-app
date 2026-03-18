import { EditProfileContainer, EditProfileInfo, EditProfileSubtitle, EditProfileTitle } from './edit-profile.style';

export const EditProfile = () => {
  return (
    <EditProfileContainer>
      <EditProfileTitle>Editar perfil</EditProfileTitle>
      <EditProfileSubtitle>
        Essa tela foi criada para receber a edição de dados do usuário.
      </EditProfileSubtitle>
      <EditProfileInfo>
        Em breve você poderá alterar nome, avatar e outras preferências por aqui.
      </EditProfileInfo>
    </EditProfileContainer>
  );
};
