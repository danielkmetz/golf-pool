import React from 'react';
import { Container, Typography, Button, Grid, Paper, Modal, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GolfBackground from './misty-golf-course.jpg';
import { useState } from 'react'; 

const WelcomePage = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handlePrivacyOpen = () => setPrivacyOpen(true);
  const handlePrivacyClose = () => setPrivacyOpen(false);
  const handleContactOpen = () => setContactOpen(true);
  const handleContactClose = () => setContactOpen(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  return (
    <div
      style={{
        backgroundImage: `url(${GolfBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        paddingTop: '2rem',
      }}
    >
      <Container maxWidth="lg" >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', 
            marginBottom: 2,
            overflow: 'auto',
            maxHeight: '100%',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.4)' }}
          >
            Welcome to The Golf Pool
          </Typography>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Increase opacity for better text contrast
            marginBottom: 2,
          }}
        >
        <Paper>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9)' }}
          >
            Join or create a pool and pick your favorite golfers for the upcoming PGA tournament.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9)', padding: 2 }}
          >
            Compete with friends and other golf enthusiasts to see who can assemble the best team of golfers. Choose
            different scoring formats when joining or creating a pool. 
            Track live scores and see your picks' performance throughout the tournament. The user with the lowest 
            total score at the end wins the pool and the cash prize!
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                component={Link}
                to="/join-pool"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SportsGolfIcon />}
                sx={{
                  marginTop: 2,
                  marginBottom: 2,
                  backgroundColor: 'DarkGreen',
                  '&:hover': {
                    backgroundColor: 'green',
                  }
                }}
              >
                Join an Existing Pool
              </Button>
            </Grid>
            <Grid item>
              <Button
                component={Link}
                to="/create-pool"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  marginTop: 2,
                  marginBottom: 2,
                  backgroundColor: 'DarkGreen',
                  '&:hover': {
                    backgroundColor: 'green',
                  }
                }}
              >
                Create a New Pool
              </Button>
            </Grid>
          </Grid>
          </Paper>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Increase opacity for better text contrast
            marginBottom: '9.05rem'
          }}
        >
        <Paper>
          <Typography variant="h4" gutterBottom sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9)' }}>
            Key Features
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4} sx={{ marginBottom: 2 }}>
              <Typography variant="h6">
                <SportsGolfIcon /> Live Score & Weather Tracking
              </Typography>
              <Typography variant="body1">
                Follow your golfers' scores & hourly weather in real-time and stay updated throughout the tournament.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ marginBottom: 2 }}>
              <Typography variant="h6">
                <AddCircleOutlineIcon /> Multiple Scoring Formats
              </Typography>
              <Typography variant="body1">
                Users can create or join pools with different formats that include:
              </Typography>
              <Typography variant="body2">
                - Single Week Tourney 4 Best Scores
              </Typography>
              <Typography variant="body1">
                - Single Week Salary Cap
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ marginBottom: 2, paddingRight: '1rem' }}>
              <Typography variant="h6">
                <SportsGolfIcon /> Leave buyins and payouts to us
              </Typography>
              <Typography variant="body1">
                Users are charged their buyin securely when they make there golfer selections and paid out at
                the conclusion of the tournament by us
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        </Paper>
        {/* Contact and Privacy Links */}
        <Typography variant="body2" sx={{ marginTop: 4 }}>
          <span onClick={handleContactOpen} style={{ cursor: 'pointer', textDecoration: 'underline', marginRight: '1rem' }}>Contact</span>
          <span onClick={handlePrivacyOpen} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy</span>
        </Typography>

        {/* Privacy Policy Modal */}
        <Modal
          open={privacyOpen}
          onClose={handlePrivacyClose}
          aria-labelledby="privacy-policy-title"
          aria-describedby="privacy-policy-description"
        >
          <Box sx={modalStyle}>
            <Typography id="privacy-policy-title" variant="h6" component="h2">
              Privacy Policy
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Last Updated: 10/8/2024
            </Typography>
            <Typography sx={{ mt: 2 }}>
              The Golf Pool LLC is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your information when you use our mobile application ("App"). By using the App, you agree to the collection and use of information in accordance with this policy.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              1. Information We Collect
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Personal Information:</strong> When you create an account, we may collect personal information such as your name, email address, and username.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Payment Information:</strong> We use Stripe to process payments. Payment information, including your card details and purchase history related to the card used, is sent to Stripe for payment processing.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>In-App Messages:</strong> We collect and store messages that you send through the chat feature in the App.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Profile Pictures:</strong> If you choose to upload a profile picture, the photo is sent to and stored in Amazon S3.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Crash Logs and Diagnostic Information:</strong> We collect crash logs and diagnostic information to help improve the performance of the App.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Device Information:</strong> We collect certain device information, such as screen size and device model, in order to render app styling properly across different devices.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Usage Data:</strong> We may collect information on how the App is accessed and used, including your device's IP address, browser type, version, the pages of our App that you visit, the time and date of your visit, and other diagnostic data.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Cookies:</strong> We may use cookies and similar tracking technologies to track the activity on our App and store certain information.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              2. How We Use Your Information
            </Typography>
            <Typography sx={{ mt: 1 }}>
              We use the collected data for various purposes:
            </Typography>
            <Typography sx={{ ml: 2 }}>
              - To provide and maintain the App.<br />
              - To notify you about changes to our App.<br />
              - To allow you to participate in interactive features of our App when you choose to do so.<br />
              - To provide customer support.<br />
              - To monitor the usage of the App.<br />
              - To detect, prevent, and address technical issues.<br />
              - To personalize your experience and provide content and features that match your interests.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              3. Sharing of Your Information
            </Typography>
            <Typography sx={{ mt: 1 }}>
              We may share your information with:
            </Typography>
            <Typography sx={{ ml: 2 }}>
              <strong>Service Providers:</strong> We may employ third-party companies and individuals to facilitate our App, provide the service on our behalf, perform service-related services, or assist us in analyzing how our App is used. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </Typography>
            <Typography sx={{ mt: 1, ml: 2 }}>
              <strong>Legal Requirements:</strong> We may disclose your Personal Information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              4. Security of Your Information
            </Typography>
            <Typography sx={{ mt: 1 }}>
              We value your trust in providing us with your Personal Information, and we strive to use commercially acceptable means of protecting it. However, please remember that no method of transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              5. Your Data Protection Rights
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Depending on your location, you may have the following rights regarding your Personal Information:
            </Typography>
            <Typography sx={{ ml: 2 }}>
              - The right to access – You have the right to request copies of your Personal Information.<br />
              - The right to rectification – You have the right to request that we correct any information you believe is inaccurate.<br />
              - The right to erasure – You have the right to request that we erase your Personal Information under certain conditions.<br />
              - The right to restrict processing – You have the right to request that we restrict the processing of your Personal Information under certain conditions.<br />
              - The right to object to processing – You have the right to object to our processing of your Personal Information under certain conditions.<br />
              - The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              6. Links to Other Sites
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Our App may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site.
            </Typography>
          </Box>
        </Modal>

        {/* Contact Modal */}
        <Modal
          open={contactOpen}
          onClose={handleContactClose}
          aria-labelledby="contact-title"
          aria-describedby="contact-description"
        >
          <Box sx={modalStyle}>
            <Typography id="contact-title" variant="h6" component="h2">
              Contact Us
            </Typography>
            <Typography id="contact-description" sx={{ mt: 2 }}>
              Questions about The Golf Pool? Please contact us at the following email:
              <br />
              <a href="mailto:thegolfpoolhelp@gmail.com">thegolfpoolhelp@gmail.com</a>
            </Typography>
          </Box>
        </Modal>
      </Container>
    </div>
  );
};

export default WelcomePage;
