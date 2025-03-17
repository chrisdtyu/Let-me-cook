import * as React from 'react';
import Api from './Api';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const Note = ({ recipeId, noteSubmitted }) => {
  const [enteredNote, setEnteredNote] = React.useState('');
  const [userId, setUserId] = React.useState(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const navigate = useNavigate();

  // Fetch user details using firebase_uid
  React.useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    console.log(firebaseUid)
    if (firebaseUid) {
      Api.callApiGetUser(firebaseUid)
        .then((res) => {
          console.log("API Response:", res);
          const user = JSON.parse(res.express);
          console.log("User data:", user);

          if (user && user.user_id) {
            setUserId(user.user_id);
          } else {
            alert('User data not found.');
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          alert('Error fetching user data. Please try again.');
        });
    } else {
      alert('No firebase UID found.');
    }
  }, [navigate]);

  // Fetch the note data for this recipe once the userId is set
  React.useEffect(() => {
    if (userId && recipeId) {
      Api.callApiGetNote(recipeId, userId)
        .then((res) => {
          if (res && res.note) {
            setEnteredNote(res.note);  // Populate the note if it exists
          }
        })
        .catch((error) => {
          console.error('Error fetching note data:', error);
          alert('Error fetching note data. Please try again.');
        });
    }
  }, [userId, recipeId]);  // Re-run when userId or recipeId changes

  const handleSubmit = (event) => {
    let isValid = true;
    if (!enteredNote) {
      setEnteredNote('');
      isValid = false;
    }

    // Only submit if everything is valid
    if (enteredNote && userId) {
      const noteData = {
        user_id: userId,
        recipe_id: recipeId,
        note: enteredNote
      };

      console.log("Review data being sent to API:", noteData);

      Api.callApiAddNote(noteData)
        .then((res) => {
          console.log('Note submitted:', res.body);
          setSubmitSuccess(true);
          setTimeout(() => {
            noteSubmitted();
          }, 1000);
        })
        .catch((error) => {
          console.error('Error submitting Note:', error);
          alert('There was an error submitting your note. Please try again later.');
        });
    }
  };

  return (
    <MainGridContainer
      container
      spacing={1}
      style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem' }}
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs />
      <Grid item style={{ width: 400 }}>
        <Typography variant="h5" gutterBottom component="div">
          Leave a Note:
        </Typography>
        <TextField
          id="note-body"
          value={enteredNote}
          label="Note"
          style={{ width: 400 }}
          multiline
          rows={4}
          onChange={(e) => setEnteredNote(e.target.value)}
          inputProps={{ maxLength: 200 }}
        />
        <Grid item xs={12}>
          <Button id="submit-button" variant="contained" onClick={handleSubmit}>
            <b>Save Note</b>
          </Button>
        </Grid>

        {submitSuccess && (
          <Grid item xs={12}>
            <Typography id="confirmation-message" variant="h6" color="#66bb6a" paddingTop={2}>
              Your note has been saved!!
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid item xs />
    </MainGridContainer>
  );
};

export default Note;
