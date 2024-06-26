import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const ArticleModal = ({ article, open, onClose }) => {
  const [articleContent, setArticleContent] = useState(null);

  useEffect(() => {
    const fetchArticleContent = async () => {
      try {
        const response = await fetch(article.links.web.href); // Assuming article.links.web.href is the URL
        const htmlContent = await response.text();
        setArticleContent(htmlContent);
      } catch (error) {
        console.error('Error fetching article content:', error);
      }
    };

    if (open && article && article.links.web.href) {
      fetchArticleContent();
    }
  }, [article, open]);

  if (!article) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{article.headline}</DialogTitle>
      <DialogContent>
        {articleContent ? (
          <div dangerouslySetInnerHTML={{ __html: articleContent }} />
        ) : (
          <Typography variant="body1">Loading article content...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleModal;
