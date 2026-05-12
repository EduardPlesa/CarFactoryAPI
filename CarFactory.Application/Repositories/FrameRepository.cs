using CarFactory.Application.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace CarFactory.Application.Repositories
{
    internal class FrameRepository : IFrameRepository
    {
        private readonly List<Frame> _frames = new();
        public Task<bool> CreateAsync(Frame frame)
        {
            _frames.Add(frame);
            return Task.FromResult(true);
        }


        public Task<IEnumerable<Frame>> GetAllAsync()
        {
           return Task.FromResult(_frames.AsEnumerable());
        }

        public Task<Frame?> GetByIdAsync(Guid id)
        {
            var frame = _frames.SingleOrDefault(x => x.Id == id);
            return Task.FromResult(frame);
        }

        public Task<bool> UpdateAsync(Frame frame)
        {
            var frameIndex = _frames.FindIndex(x => x.Id == frame.Id);
            if (frameIndex == -1)
                return Task.FromResult(false);

            _frames[frameIndex] = frame;
            return Task.FromResult(true);
        }
        public Task<bool> DeleteByIdAsync(Guid id)
        {
            var removedCount = _frames.RemoveAll(x => x.Id == id);
            var frameRemoved = removedCount > 0;
            return Task.FromResult(frameRemoved);
        }

        Task<Frame?> IFrameRepository.GetBySlugAsync(string slug)
        {
            var frame = _frames.SingleOrDefault(x => x.Slug == slug);
            return Task.FromResult(frame);
        }
    }
}
