package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.Post;
import com.example.backend.model.PostLike;
import com.example.backend.model.Comment;
import com.example.backend.model.CommentLike;
import com.example.backend.model.Hashtag;
import com.example.backend.model.Users; 
import com.example.backend.dto.PostRequest;
import com.example.backend.dto.CommentRequest;
import com.example.backend.repository.PostLikeRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.example.backend.repository.CommentLikeRepository;
import com.example.backend.repository.HashtagRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Set; 
import java.util.HashSet; 

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private PostLikeRepository postLikeRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentLikeRepository commentLikeRepository;
    
    @Autowired
    private HashtagRepository hashtagRepository;
    
    public Post createPost(PostRequest postRequest) {
        System.out.println("Received post request: " + postRequest.getText() + ", username: " + postRequest.getUsername());
        
        Post post = new Post();
        post.setText(postRequest.getText());
        
        post.setCreatedDate(LocalDateTime.now());
        
        if(postRequest.getUsername() != null) {
            post.setUsername(postRequest.getUsername());
        }
        
        if (postRequest.getHashtags() != null && !postRequest.getHashtags().isEmpty()) {
            Set<Hashtag> hashtagEntities = new HashSet<>();
            for (String hashtagName : postRequest.getHashtags()) {
                Hashtag hashtag = hashtagRepository.findByName(hashtagName);
                if (hashtag == null) {
                    hashtag = new Hashtag(hashtagName);
                    hashtag = hashtagRepository.save(hashtag); 
                }
                hashtagEntities.add(hashtag);
            }
            post.setHashtags(hashtagEntities);
        }
        
        Post savedPost = postRepository.save(post);
        System.out.println("Post saved with ID: " + savedPost.getId());
        return savedPost;
    }

    public Post createPostWithMedia(String text, String username, List<String> hashtags, 
                                    List<String> imageUrls, List<String> videoUrls) {
        Users user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        Post post = new Post();
        post.setText(text);
        post.setUsername(username);
        post.setCreatedDate(LocalDateTime.now()); 
        
        if (hashtags != null && !hashtags.isEmpty()) {
            Set<Hashtag> hashtagEntities = new HashSet<>();
            for (String tag : hashtags) {
                Hashtag hashtag = hashtagRepository.findByName(tag);
                if (hashtag == null) {
                    hashtag = new Hashtag(tag);
                    hashtag = hashtagRepository.save(hashtag); 
                }
                hashtagEntities.add(hashtag);
            }
            post.setHashtags(hashtagEntities);
        }
        
        if (imageUrls != null) {
            post.setImageUrls(imageUrls);
        }
        
        if (videoUrls != null) {
            post.setVideoUrls(videoUrls);
        }
        
        return postRepository.save(post);
    }

    public List<Post> getPostsByUsername(String username) {
        System.out.println("Fetching posts for username: " + username);
        List<Post> posts = postRepository.findByUsernameOrderByCreatedDateDesc(username);
        
        for (Post post : posts) {
            int count = postLikeRepository.countByPostId(post.getId());
            post.setLikeCount(count);
            
            Users author = userRepository.findByUsername(post.getUsername());
            if (author != null) {
                post.setAuthorUsername(post.getUsername());
                post.setAuthorName(author.getFirstName() + " " + author.getLastName());
                post.setAuthorProfilePhoto(author.getProfilePhoto());
                post.setAuthorMajor(author.getMajor());
            }
            
            List<Comment> topLevelComments = commentRepository.findByPostIdAndParentIdIsNullOrderByCreatedDateAsc(post.getId());
            List<Map<String, Object>> formattedComments = new ArrayList<>();
            
            for (Comment comment : topLevelComments) {
                Map<String, Object> formattedComment = formatComment(comment);
                
                List<Comment> replies = commentRepository.findByParentIdOrderByCreatedDateAsc(comment.getId());
                List<Map<String, Object>> formattedReplies = new ArrayList<>();
                
                for (Comment reply : replies) {
                    formattedReplies.add(formatComment(reply));
                }
                
                if (!formattedReplies.isEmpty()) {
                    formattedComment.put("replies", formattedReplies);
                }
                
                formattedComments.add(formattedComment);
            }
            
            post.setComments(formattedComments);
        }
        
        return posts;
    }
    
    private Map<String, Object> formatComment(Comment comment) {
        Map<String, Object> formattedComment = new HashMap<>();
        
        formattedComment.put("id", comment.getId());
        formattedComment.put("text", comment.getText());
        formattedComment.put("date", comment.getCreatedDate());
        
        int likeCount = commentLikeRepository.countByCommentId(comment.getId());
        formattedComment.put("likes", likeCount);
        
        if (comment.getParentId() != null) {
            formattedComment.put("parentId", comment.getParentId());
        }
        
        Users user = userRepository.findByUsername(comment.getUsername());
        Map<String, Object> author = new HashMap<>();
        if (user != null) {
            author.put("username", user.getUsername());
            author.put("name", user.getFirstName() + " " + user.getLastName());
            author.put("profilePhoto", user.getProfilePhoto());
        } else {
            author.put("username", comment.getUsername());
            author.put("name", "Unknown User");
            author.put("profilePhoto", null);
        }
        formattedComment.put("author", author);
        
        return formattedComment;
    }

    public int updatePostLike(Long postId, String username, boolean isLiked) {
        PostLike existingLike = postLikeRepository.findByPostIdAndUsername(postId, username);
        
        if (isLiked) {
            if (existingLike == null) {
                PostLike newLike = new PostLike();
                newLike.setPostId(postId);
                newLike.setUsername(username);
                newLike.setCreatedDate(LocalDateTime.now());
                postLikeRepository.save(newLike);
            }
        } else {
            if (existingLike != null) {
                postLikeRepository.delete(existingLike);
            }
        }
        
        return postLikeRepository.countByPostId(postId);
    }
    
    public List<Long> getUserLikedPostIds(String username) {
        return postLikeRepository.findPostIdsByUsername(username);
    }
    
    public Comment addCommentToPost(CommentRequest commentRequest) {
        Comment comment = new Comment();
        comment.setText(commentRequest.getText());
        comment.setUsername(commentRequest.getUsername());
        comment.setPostId(commentRequest.getPostId());
        comment.setCreatedDate(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }
    
    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedDateAsc(postId);
    }
    
    public Comment addReplyToComment(Long postId, Long commentId, String text, String username) {
        Comment reply = new Comment();
        reply.setText(text);
        reply.setUsername(username);
        reply.setPostId(postId);
        reply.setParentId(commentId);
        reply.setCreatedDate(LocalDateTime.now());
        
        return commentRepository.save(reply);
    }
    
    public int updateCommentLike(Long commentId, String username, boolean isLiked) {
        CommentLike existingLike = commentLikeRepository.findByCommentIdAndUsername(commentId, username);
        
        if (isLiked) {
            if (existingLike == null) {
                CommentLike newLike = new CommentLike();
                newLike.setCommentId(commentId);
                newLike.setUsername(username);
                newLike.setCreatedDate(LocalDateTime.now());
                commentLikeRepository.save(newLike);
            }
        } else {
            if (existingLike != null) {
                commentLikeRepository.delete(existingLike);
            }
        }
        
        return commentLikeRepository.countByCommentId(commentId);
    }
    
    public List<Long> getUserLikedCommentIds(String username) {
        return commentLikeRepository.findCommentIdsByUsername(username);
    }

    @Transactional
    public void deletePost(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
            
            List<Comment> comments = commentRepository.findByPostIdOrderByCreatedDateAsc(postId);
            for (Comment comment : comments) {
                commentLikeRepository.deleteByCommentId(comment.getId());
            }
            
            postLikeRepository.deleteByPostId(postId);
            
            commentRepository.deleteByPostId(postId);
            
            postRepository.delete(post);
            
            System.out.println("Successfully deleted post with ID: " + postId);
        } catch (Exception e) {
            System.err.println("Error deleting post with ID " + postId + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public int getPostLikeCount(Long postId) {
        return postLikeRepository.countByPostId(postId);
    }

    public int getCommentLikeCount(Long commentId) {
        return commentLikeRepository.countByCommentId(commentId);
    }
}
