import React, { useEffect, useState } from 'react';
import { Typography, Paper, Grid, Box } from '@mui/material';
import { fetchNews, selectNews } from '../../Features/NewsSlice';
import { useSelector, useDispatch } from 'react-redux';
import ArticleModal from './ArticleModal';

const NewsComponent = () => {
    const dispatch = useDispatch();
    const newsResults = useSelector(selectNews);
    const [selectedArticle, setSelectedArticle] = useState(null); // State to track the selected article
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchNews());
    }, [dispatch]);

    const handleOpenModal = (article) => {
        setSelectedArticle(article);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedArticle(null);
        setIsModalOpen(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', // Center vertically
                minHeight: '100vh', // Set minimum height to fill the viewport
                cursor: 'pointer',
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#0098', // Orange background color
                    color: '#FFF', // White text color
                    fontFamily: 'Roboto, sans-serif', // Use a professional font
                    fontWeight: 'bold',
                    fontSize: '2.5rem',
                    textAlign: 'center',
                    padding: '1rem', // Add padding for better spacing
                    borderRadius: '8px', // Rounded corners
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
                }}
            >
                Latest News
            </Typography>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={2} sx={{ maxWidth: '1200px' }}>
                    {newsResults.map((article, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Paper
                                style={{
                                    padding: '20px',
                                    cursor: 'pointer',
                                    maxWidth: '500px',
                                }}
                                onClick={() => handleOpenModal(article)}
                            >
                                <Typography variant="h5" gutterBottom>
                                    <b>{article.headline}</b>
                                </Typography>
                                <img
                                    src={article.images[0]?.url}
                                    alt="Article"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                <Typography variant="body1" style={{ marginTop: '10px' }}>
                                    {article.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <ArticleModal article={selectedArticle} open={isModalOpen} onClose={handleCloseModal} />
        </Box>
    );
};

export default NewsComponent;
