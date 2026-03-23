import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import toast from 'react-hot-toast';

export const useBlogs = (params = {}) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogService.getBlogs(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfiniteBlogs = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['blogs-infinite', params],
    queryFn: ({ pageParam = 1 }) => blogService.getBlogs({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBlog = (slug) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBlog(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopBlogs = (limit = 5) => {
  return useQuery({
    queryKey: ['top-blogs', limit],
    queryFn: () => blogService.getTopBlogs(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserBlogs = (userId, params = {}) => {
  return useQuery({
    queryKey: ['user-blogs', userId, params],
    queryFn: () => blogService.getUserBlogs(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => blogService.createBlog(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog published successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create blog');
    }
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => blogService.updateBlog(id, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', data.blog.slug] });
      toast.success('Blog updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update blog');
    }
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete blog');
    }
  });
};

export const useLikeBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => blogService.likeBlog(id),
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: ['blog', blogId] });
      const previousBlog = queryClient.getQueryData(['blog', blogId]);

      if (previousBlog) {
        queryClient.setQueryData(['blog', blogId], (old) => ({
          ...old,
          blog: {
            ...old.blog,
            isLiked: !old.blog.isLiked,
            likesCount: old.blog.isLiked
              ? old.blog.likesCount - 1
              : old.blog.likesCount + 1
          }
        }));
      }

      return { previousBlog };
    },
    onError: (err, blogId, context) => {
      if (context?.previousBlog) {
        queryClient.setQueryData(['blog', blogId], context.previousBlog);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    }
  });
};
